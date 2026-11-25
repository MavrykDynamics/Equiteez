/**
 * Sign-in modal: Mavryk Wallet (extension) or an email wallet (Dynamic).
 * The choice between them shows only with WALLET_CHOICE_ENABLED; otherwise
 * the modal opens on the email wallet. Email and code steps follow the
 * Figma "Sign-in, restore, expired" designs.
 *
 * Email flow: email → code → wallet set-up → RWA sign-in, each step with a
 * recoverable error. While a step runs its button shows a loader and the
 * form is locked; once the wallet set-up is known, a new account shows
 * "Creating Your Account" and then "Your Account Is Ready", an existing one
 * "Restoring Your Account" until the sign-in is done. "Continue with Google" leaves for Google; on return the
 * modal reopens and finishes the sign-in. A password-protected wallet that
 * comes locked asks for the password ("Unlock Your Account On This Device").
 * An account with an authenticator app (or passkey) confirms the sign-in with
 * it first ("Confirm Your Sign-In", no Figma yet).
 * Closing the modal never deletes a wallet.
 */
import clsx from "clsx";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { HashShortView } from "~/lib/atoms/HashShortView";
import { RButton } from "~/lib/atoms/RButton";
import { RChip } from "~/lib/atoms/RChip/RChip";
import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { formatDayMonthYear } from "~/lib/utils/date";
import { useIsMobileViewport } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { isWalletChoiceEnabled } from "~/providers/WalletProvider/dynamic/dynamic.config";
import type { DynamicWalletOption } from "~/providers/WalletProvider/dynamic/dynamic.errors";
import type { SecondFactor } from "~/providers/WalletProvider/dynamic/dynamicClient.client";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import type { WalletSetupListener } from "~/providers/WalletProvider/wallet.types";

import {
  describeConnectError,
  isValidEmail,
  type ConnectStage,
  type LockedWallet,
  type SecondFactorMethods,
} from "./connectWalletErrors";
import { CodeInput, CODE_LENGTH } from "./CodeInput";
import { RGoogleIcon } from "./RGoogleIcon";
import styles from "./ConnectWalletModal.module.css";
import { describeError } from "~/services/direct/guardedInjector";

const RESEND_COOLDOWN_MS = 30_000;

/** The account an existing-account sign-in is restoring */
type RestoringAccount = {
  address: string;
  email: string | null;
  lastUsedAt: Date | null;
};

type Step =
  | { name: "choose" }
  | { name: "email"; error?: string }
  | { name: "code"; error?: string }
  /** A new account: its wallet is being created and signed in */
  | { name: "creating" }
  /** An existing account: its wallet is being opened and signed in */
  | { name: "restoring"; account: RestoringAccount }
  /** A new account is signed in: shows its address */
  | { name: "ready"; address: string }
  | { name: "select-wallet"; wallets: DynamicWalletOption[] }
  | { name: "unlock"; wallet: LockedWallet; error?: string }
  | {
      name: "second-factor";
      methods: SecondFactorMethods;
      /** A recovery code instead of the app's code */
      isRecoveryCode?: boolean;
      error?: string;
    }
  | { name: "failed"; message: string };

/**
 * The code field shows unless a passkey is the only way: with nothing named,
 * it still takes the app's code or a recovery code, so the step never ends up
 * with nothing to do.
 */
const hasCodeFactor = (methods: SecondFactorMethods) =>
  methods.hasAuthenticator || !methods.hasPasskey;

/** The action running on the current step: its button shows a loader */
type BusyAction =
  | "start"
  | "email"
  | "google"
  | "code"
  | "password"
  | "second-factor"
  | "passkey"
  | "select";

/** Steps with a field to focus */
const isFormStep = (name: Step["name"]) =>
  name === "email" ||
  name === "code" ||
  name === "unlock" ||
  name === "second-factor";

type ConnectWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ConnectWalletModal({
  isOpen,
  onClose,
}: ConnectWalletModalProps) {
  const { dynamic } = useWalletContext();
  const { connect, connectWithWallet } = useUserContext();
  const isMobile = useIsMobileViewport();
  const canChooseWallet = isWalletChoiceEnabled();
  const emailInputId = useId();
  const passwordInputId = useId();

  const [step, setStep] = useState<Step>({ name: "choose" });
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [secondFactorCode, setSecondFactorCode] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  // Results of a step started before the modal closed or moved on are ignored
  const runIdRef = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const nextRun = () => ++runIdRef.current;
  const isCurrent = (run: number) => run === runIdRef.current;

  const close = useCallback(() => {
    runIdRef.current += 1;
    onClose();
  }, [onClose]);

  /**
   * Connects with `connectStep`, then signs in. A new account ends on
   * "Your Account Is Ready"; an existing one closes the modal.
   */
  const connectAndSignIn = useCallback(
    async ({
      connectStep,
      stage,
      action,
      onError,
    }: {
      connectStep: (onSetup: WalletSetupListener) => Promise<unknown>;
      /** Read on failure: a step can move on, e.g. once a code is accepted */
      stage: ConnectStage | (() => ConnectStage);
      /** Its button shows the loader until the wallet set-up is known */
      action: BusyAction;
      onError: (message: string) => Step;
    }) => {
      const run = nextRun();
      let needsEmail = false;
      // Set once the wallet turns out to be new: the sign-in ends on "ready"
      let newAddress: string | null = null;
      let isCreating = false;

      const handleSetup: WalletSetupListener = (setup) => {
        if (!isCurrent(run)) return;

        if (setup.kind === "creating" || setup.isNew || isCreating) {
          isCreating = true;
          if (setup.kind === "opening") newAddress = setup.address;
          setStep({ name: "creating" });
          return;
        }

        setStep({
          name: "restoring",
          account: {
            address: setup.address,
            email: setup.email,
            lastUsedAt: setup.lastUsedAt,
          },
        });
      };

      setBusy(action);

      try {
        await connectWithWallet(async () => {
          const connected = await connectStep(handleSetup);
          needsEmail = connected === "needs-email";
          return !needsEmail;
        });
        if (!isCurrent(run)) return;

        setBusy(null);
        if (needsEmail) setStep({ name: "email" });
        else if (newAddress) setStep({ name: "ready", address: newAddress });
        else close();
      } catch (error) {
        if (!isCurrent(run)) return;

        setBusy(null);

        const view = describeConnectError(
          error,
          typeof stage === "function" ? stage() : stage
        );

        if (view.kind === "message" && view.shouldRestart) {
          setStep({ name: "email", error: view.message });
          return;
        }

        setStep(
          view.kind === "select-wallet"
            ? { name: "select-wallet", wallets: view.wallets }
            : view.kind === "unlock"
              ? { name: "unlock", wallet: view.wallet }
              : view.kind === "second-factor"
                ? { name: "second-factor", methods: view.methods }
                : onError(view.message)
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [close, connectWithWallet]
  );

  /**
   * Uses a live Dynamic session if there is one, otherwise asks for email.
   * Runs on the email step (its button loads) or from "Try again".
   */
  const startEmail = useCallback(() => {
    if (!dynamic) return;

    setStep((current) =>
      current.name === "failed" ? current : { name: "email" }
    );
    void connectAndSignIn({
      connectStep: (onSetup) => dynamic.start(onSetup),
      stage: "connect",
      action: "start",
      onError: (message) => ({ name: "failed", message }),
    });
  }, [connectAndSignIn, dynamic]);

  /** Back from Google: completes the sign-in and opens the wallet */
  const finishGoogle = useCallback(() => {
    if (!dynamic) return;

    setStep({ name: "email" });
    void connectAndSignIn({
      connectStep: (onSetup) => dynamic.finishGoogleSignIn(onSetup),
      stage: "connect",
      action: "google",
      onError: (message) => ({ name: "email", error: message }),
    });
  }, [connectAndSignIn, dynamic]);

  // Fresh state every time the modal opens
  useEffect(() => {
    if (!isOpen) return;

    setCode("");
    setPassword("");
    setBusy(null);
    setStep({ name: "choose" });
    if (dynamic?.hasPendingGoogleSignIn()) finishGoogle();
    else if (!canChooseWallet) startEmail();
    // Only on open: startEmail changes with wallet state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Move focus to the field of the email, code and password steps, also
  // once a step's loader ends (the field was locked meanwhile)
  useEffect(() => {
    if (isFormStep(step.name) && !busy) {
      contentRef.current?.querySelector("input")?.focus();
    }
  }, [step.name, busy]);

  // Resend countdown
  useEffect(() => {
    if (step.name !== "code" || resendAvailableAt <= Date.now()) return;

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step.name, resendAvailableAt]);

  const connectMavrykWallet = () => {
    close();
    // Opening the extension must not wait for this modal
    void Promise.resolve()
      .then(connect)
      .catch((error: unknown) =>
        // Name and message only: an error may carry request details
        console.error("Failed to connect wallet:", describeError(error))
      );
  };

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!dynamic) return;

    if (!isValidEmail(email)) {
      setStep({ name: "email", error: "Enter a valid email address." });
      return;
    }

    const run = nextRun();
    setStep({ name: "email" });
    setBusy("email");

    try {
      const result = await dynamic.sendOtp(email);
      if (!isCurrent(run)) return;

      if (result === "already-authenticated") {
        startEmail();
        return;
      }

      setBusy(null);
      setCode("");
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
      setNow(Date.now());
      setStep({ name: "code" });
    } catch (error) {
      if (!isCurrent(run)) return;

      const view = describeConnectError(error, "email");
      setBusy(null);
      setStep({
        name: "email",
        error: view.kind === "message" ? view.message : undefined,
      });
    }
  };

  const submitCode = (event: FormEvent) => {
    event.preventDefault();
    if (!dynamic || code.length < CODE_LENGTH) return;

    // Dynamic accepts a code once. A failure after that (network, wallet,
    // RWA sign-in) must not send the user back to re-enter a used-up code:
    // "Try again" reopens the wallet from the live session instead.
    let codeAccepted = false;

    void connectAndSignIn({
      connectStep: (onSetup) =>
        dynamic.verifyOtp(
          code,
          () => {
            codeAccepted = true;
          },
          onSetup
        ),
      stage: () => (codeAccepted ? "connect" : "code"),
      action: "code",
      onError: (message) =>
        codeAccepted
          ? { name: "failed", message }
          : { name: "code", error: message },
    });
  };

  const resendCode = async () => {
    if (!dynamic) return;

    const run = runIdRef.current;
    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
    setNow(Date.now());

    try {
      await dynamic.resendOtp();
      if (isCurrent(run)) setStep({ name: "code" });
    } catch (error) {
      if (!isCurrent(run)) return;

      const view = describeConnectError(error, "email");
      setStep({
        name: "code",
        error: view.kind === "message" ? view.message : undefined,
      });
    }
  };

  const continueWithGoogle = async () => {
    if (!dynamic) return;

    const run = nextRun();
    setBusy("google");

    try {
      // Leaves the page; the modal finishes the sign-in on return
      await dynamic.signInWithGoogle();
    } catch (error) {
      if (!isCurrent(run)) return;

      const view = describeConnectError(error, "connect");
      setBusy(null);
      setStep({
        name: "email",
        error: view.kind === "message" ? view.message : undefined,
      });
    }
  };

  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    if (!dynamic || step.name !== "unlock" || !password) return;

    const { wallet } = step;

    void connectAndSignIn({
      connectStep: (onSetup) =>
        dynamic.unlockWallet(wallet.walletId, password, onSetup),
      stage: "unlock",
      action: "password",
      onError: (message) => ({ name: "unlock", wallet, error: message }),
    });
  };

  const passSecondFactor = (factor: SecondFactor) => {
    if (!dynamic || step.name !== "second-factor") return;

    const { methods, isRecoveryCode } = step;

    void connectAndSignIn({
      connectStep: (onSetup) => dynamic.passSecondFactor(factor, onSetup),
      stage: "second-factor",
      action: factor.kind === "passkey" ? "passkey" : "second-factor",
      onError: (message) => ({
        name: "second-factor",
        methods,
        isRecoveryCode,
        error: message,
      }),
    });
  };

  const submitSecondFactor = (event: FormEvent) => {
    event.preventDefault();
    if (step.name !== "second-factor") return;

    const code = secondFactorCode.trim();

    if (step.isRecoveryCode ? !code : code.length < CODE_LENGTH) return;

    setSecondFactorCode("");
    passSecondFactor(
      step.isRecoveryCode
        ? { kind: "recovery-code", code }
        : { kind: "authenticator", code }
    );
  };

  const toggleRecoveryCode = () => {
    if (step.name !== "second-factor") return;

    setSecondFactorCode("");
    setStep({
      ...step,
      isRecoveryCode: !step.isRecoveryCode,
      error: undefined,
    });
  };

  const handleUseDifferentEmail = () => {
    setPassword("");
    setStep({ name: "email" });
  };

  const selectWallet = (walletId: string) => {
    if (!dynamic) return;

    void connectAndSignIn({
      connectStep: (onSetup) => dynamic.selectWallet(walletId, onSetup),
      stage: "connect",
      action: "select",
      onError: (message) => ({ name: "failed", message }),
    });
  };

  const isBusy = busy !== null;

  const resendSeconds = Math.max(
    0,
    Math.ceil((resendAvailableAt - now) / 1000)
  );

  const back = isBusy
    ? undefined
    : step.name === "code" ||
        step.name === "unlock" ||
        step.name === "second-factor"
      ? handleUseDifferentEmail
      : step.name === "email" && canChooseWallet
        ? () => setStep({ name: "choose" })
        : undefined;

  return (
    <CustomPopup
      className={isMobile ? styles.sheet : styles.modal}
      contentLabel="Connect wallet"
      contentPosition={isMobile ? "bottom" : "center"}
      isOpen={isOpen}
      onRequestClose={close}
    >
      <div className={styles.topRow}>
        {back && (
          <button
            aria-label="Back"
            className={styles.iconButton}
            onClick={back}
            type="button"
          >
            <RIcon name="arrow-long-left" size="medium" />
          </button>
        )}
        <button
          aria-label="Close"
          className={clsx(styles.iconButton, styles.closeButton)}
          onClick={close}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div aria-busy={isBusy} className={styles.content} ref={contentRef}>
        {step.name === "choose" && (
          <>
            <Header
              title="Connect wallet"
              description="Choose how you want to sign in to Equiteez."
            />
            <div className={styles.options}>
              <OptionButton
                description="Use the Mavryk Wallet browser extension"
                onClick={connectMavrykWallet}
                title="Mavryk Wallet"
              />
              {dynamic && (
                <OptionButton
                  description="No extension needed: we email you a code"
                  onClick={startEmail}
                  title="Continue with email"
                />
              )}
            </div>
          </>
        )}

        {step.name === "email" && (
          <form className={styles.form} noValidate onSubmit={submitEmail}>
            <Header
              title="Sign In"
              description="Enter your email and we’ll send you a 6-digit code. New here? We’ll create your account automatically."
            />
            <div className={styles.field}>
              <label className={styles.label} htmlFor={emailInputId}>
                Email
              </label>
              <RInput
                aria-invalid={Boolean(step.error)}
                aria-label="Email"
                autoComplete="email"
                className={clsx(styles.input, step.error && styles.inputError)}
                disabled={isBusy}
                id={emailInputId}
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@mail.com"
                type="email"
                value={email}
              />
              <ErrorText message={step.error} />
            </div>
            <div className={styles.buttons}>
              <RButton
                className={styles.primaryButton}
                disabled={!email.trim() || isBusy}
                isLoading={busy === "email" || busy === "start"}
                size="large"
                tone="black"
                type="submit"
                variant="primary"
              >
                Email Me A Code
              </RButton>
              <Divider />
              <RButton
                className={styles.primaryButton}
                disabled={isBusy}
                iconLeft={<RGoogleIcon />}
                isLoading={busy === "google"}
                onClick={continueWithGoogle}
                size="large"
                tone="black"
                type="button"
                variant="secondary"
              >
                Continue With Google
              </RButton>
            </div>
            <Note>
              Your sign-in and keys are secured by Dynamic.
              <br />
              Equiteez never holds your keys.
            </Note>
          </form>
        )}

        {step.name === "second-factor" && (
          <form
            className={styles.form}
            noValidate
            onSubmit={submitSecondFactor}
          >
            <div className={styles.heroBlock}>
              <span className={styles.heroIcon}>
                <RIcon aria-hidden name="lock" size="medium" />
              </span>
              <Header
                title="Confirm Your Sign-In"
                description={
                  !hasCodeFactor(step.methods)
                    ? "Use the passkey saved for this account."
                    : step.isRecoveryCode
                      ? "Enter one of the recovery codes you saved when you set up your authenticator app."
                      : "Enter the 6-digit code from your authenticator app."
                }
              />
            </div>
            {hasCodeFactor(step.methods) ? (
              <>
                {step.isRecoveryCode ? (
                  <div className={styles.field}>
                    <RInput
                      aria-invalid={Boolean(step.error)}
                      aria-label="Recovery code"
                      autoComplete="off"
                      className={clsx(
                        styles.input,
                        step.error && styles.inputError
                      )}
                      disabled={isBusy}
                      onChange={(event) =>
                        setSecondFactorCode(event.target.value)
                      }
                      value={secondFactorCode}
                    />
                    <ErrorText message={step.error} />
                  </div>
                ) : (
                  <div className={styles.codeBlock}>
                    <CodeInput
                      disabled={isBusy}
                      invalid={Boolean(step.error)}
                      onChange={setSecondFactorCode}
                      value={secondFactorCode}
                    />
                    <ErrorText centered message={step.error} />
                  </div>
                )}
                <div className={styles.actions}>
                  <RButton
                    className={styles.primaryButton}
                    disabled={
                      isBusy ||
                      (step.isRecoveryCode
                        ? !secondFactorCode.trim()
                        : secondFactorCode.length < CODE_LENGTH)
                    }
                    isLoading={busy === "second-factor"}
                    size="large"
                    tone="black"
                    type="submit"
                    variant="primary"
                  >
                    Confirm
                  </RButton>
                  <TextButton disabled={isBusy} onClick={toggleRecoveryCode}>
                    {step.isRecoveryCode
                      ? "Use the authenticator app"
                      : "Use a recovery code"}
                  </TextButton>
                </div>
              </>
            ) : (
              <ErrorText centered message={step.error} />
            )}
            {step.methods.hasPasskey ? (
              <RButton
                className={styles.primaryButton}
                disabled={isBusy}
                isLoading={busy === "passkey"}
                onClick={() => passSecondFactor({ kind: "passkey" })}
                size="large"
                tone="black"
                type="button"
                variant={hasCodeFactor(step.methods) ? "secondary" : "primary"}
              >
                Use A Passkey
              </RButton>
            ) : null}
          </form>
        )}

        {step.name === "unlock" && (
          <form className={styles.form} noValidate onSubmit={submitPassword}>
            <div className={styles.heroBlock}>
              <span className={styles.heroIcon}>
                <RIcon aria-hidden name="lock" size="medium" />
              </span>
              <Header
                title="Unlock Your Account On This Device"
                description="This is your first time signing in on this device. Enter your account password to restore your account here."
              />
            </div>
            <AccountCard wallet={step.wallet} />
            <div className={styles.field}>
              <label className={styles.label} htmlFor={passwordInputId}>
                Account Password
              </label>
              <RInput
                aria-invalid={Boolean(step.error)}
                autoComplete="current-password"
                className={clsx(styles.input, step.error && styles.inputError)}
                disabled={isBusy}
                id={passwordInputId}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
              <ErrorText message={step.error} />
            </div>
            <RButton
              className={styles.primaryButton}
              disabled={!password || isBusy}
              isLoading={busy === "password"}
              size="large"
              tone="black"
              type="submit"
              variant="primary"
            >
              Restore Account
            </RButton>
            <p className={styles.switchAccount}>
              Not your account?{" "}
              <TextButton disabled={isBusy} onClick={handleUseDifferentEmail}>
                Use a different email
              </TextButton>
            </p>
          </form>
        )}

        {step.name === "code" && (
          <form className={styles.form} noValidate onSubmit={submitCode}>
            <Header
              title="Enter Your Code"
              description={
                <>
                  We sent a 6-digit code to{" "}
                  <span className={styles.emphasis}>{email.trim()}</span>
                </>
              }
            />
            <div className={styles.codeBlock}>
              <CodeInput
                disabled={isBusy}
                invalid={Boolean(step.error)}
                onChange={setCode}
                value={code}
              />
              <ErrorText centered message={step.error} />
            </div>
            <div className={styles.actions}>
              <RButton
                className={styles.primaryButton}
                disabled={code.length < CODE_LENGTH || isBusy}
                isLoading={busy === "code"}
                size="large"
                tone="black"
                type="submit"
                variant="primary"
              >
                Verify
              </RButton>
              <div className={styles.linkRow}>
                <TextButton
                  disabled={resendSeconds > 0 || isBusy}
                  onClick={resendCode}
                >
                  {resendSeconds > 0
                    ? `Resend code in ${formatCountdown(resendSeconds)}`
                    : "Resend code"}
                </TextButton>
                <TextButton
                  disabled={isBusy}
                  onClick={() => setStep({ name: "email" })}
                >
                  Use a different email
                </TextButton>
              </div>
            </div>
            <Note>
              Can&apos;t find it? Check spam. After 3 tries, wait a few minutes
              before the next one.
            </Note>
          </form>
        )}

        {step.name === "creating" && (
          <div aria-live="polite" className={styles.form}>
            <StatusHeader
              description="Your account is being created. This may take a few moments, so please keep this window open."
              icon="loading-progress"
              title="Creating Your Account"
              tone="yellow"
            />
            <CancelButton onClick={close} />
          </div>
        )}

        {step.name === "restoring" && (
          <div aria-live="polite" className={styles.form}>
            <StatusHeader
              description={`We found the account for ${
                step.account.email ?? email.trim()
              }. Nothing new is created.`}
              icon="refresh"
              title="Restoring Your Account"
              tone="neutral"
            />
            <AccountCard
              wallet={{
                address: step.account.address,
                email: step.account.email,
                lastUsedAt: step.account.lastUsedAt,
              }}
            />
            <dl className={styles.details}>
              <div className={styles.detailRow}>
                <dt>Email</dt>
                <dd>{step.account.email ?? email.trim()}</dd>
              </div>
              <div className={styles.detailRow}>
                <dt>Address</dt>
                <dd>
                  <HashShortView
                    firstCharsCount={6}
                    hash={step.account.address}
                  />
                </dd>
              </div>
              <div className={styles.detailRow}>
                <dt>This Device</dt>
                <dd>
                  <RChip tone="neutral">Setting Up</RChip>
                </dd>
              </div>
            </dl>
            <CancelButton onClick={close} />
            <Note>
              Sign-in and keys are secured by Dynamic. Equiteez never holds your
              key.
            </Note>
          </div>
        )}

        {step.name === "ready" && (
          <div className={styles.form}>
            <StatusHeader
              description="This is your Mavryk address, and only you can sign transactions from it."
              icon="check"
              title="Your Account Is Ready"
              tone="green"
            />
            <AddressField address={step.address} />
            <RButton
              className={styles.primaryButton}
              onClick={close}
              size="medium"
              tone="black"
              variant="primary"
            >
              Continue
            </RButton>
          </div>
        )}

        {step.name === "select-wallet" && (
          <>
            <Header
              title="Choose a wallet"
              description="Your account has more than one wallet. Pick the one to use."
            />
            <div className={styles.options}>
              {step.wallets.map((wallet) => (
                <OptionButton
                  disabled={isBusy}
                  key={wallet.walletId}
                  onClick={() => selectWallet(wallet.walletId)}
                  title={
                    <HashShortView firstCharsCount={6} hash={wallet.address} />
                  }
                />
              ))}
            </div>
          </>
        )}

        {step.name === "failed" && (
          <div className={styles.form}>
            <Header title="Couldn't sign in" description={step.message} />
            <RButton
              className={styles.primaryButton}
              isLoading={busy === "start"}
              onClick={startEmail}
              size="large"
              tone="black"
              variant="primary"
            >
              Try again
            </RButton>
            {canChooseWallet && (
              <TextButton
                disabled={isBusy}
                onClick={() => setStep({ name: "choose" })}
              >
                Use another way
              </TextButton>
            )}
          </div>
        )}
      </div>
    </CustomPopup>
  );
}

/** 24 → "0:24", 90 → "1:30" */
function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Header({
  title,
  description,
}: {
  title: string;
  description: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <RHeading size="h6" weight="medium">
        {title}
      </RHeading>
      <RText color="neutral-700" size="body-sm">
        {description}
      </RText>
    </header>
  );
}

function OptionButton({
  title,
  description,
  disabled,
  onClick,
}: {
  title: ReactNode;
  description?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={styles.option}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <RText size="body-sm" weight="medium">
        {title}
      </RText>
      {description && (
        <RText color="neutral-700" size="body-s">
          {description}
        </RText>
      )}
    </button>
  );
}

function TextButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={styles.textButton}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className={styles.divider}>
      <span aria-hidden className={styles.dividerLine} />
      <RText color="neutral-700" size="body-sm">
        or
      </RText>
      <span aria-hidden className={styles.dividerLine} />
    </div>
  );
}

/** The account being restored: its address and when it was last used */
function AccountCard({
  wallet,
}: {
  wallet: Pick<LockedWallet, "address" | "email" | "lastUsedAt">;
}) {
  const detail = wallet.lastUsedAt
    ? `Last used ${formatDayMonthYear(wallet.lastUsedAt)}`
    : wallet.email;

  return (
    <div className={styles.accountCard}>
      <span aria-hidden className={styles.avatar} />
      <div className={styles.accountText}>
        <RText size="body-sm" weight="medium">
          <HashShortView firstCharsCount={6} hash={wallet.address} />
        </RText>
        {detail ? (
          <RText color="neutral-700" size="body-s">
            {detail}
          </RText>
        ) : null}
      </div>
    </div>
  );
}

type StatusTone = "yellow" | "green" | "neutral";

const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  yellow: styles.heroIconYellow,
  green: styles.heroIconGreen,
  neutral: styles.heroIconNeutral,
};

/** Icon badge over the heading of the account set-up steps */
function StatusHeader({
  icon,
  tone,
  title,
  description,
}: {
  icon: RIconName;
  tone: StatusTone;
  title: string;
  description: ReactNode;
}) {
  return (
    <div className={styles.heroBlock}>
      <span className={clsx(styles.heroIcon, STATUS_TONE_CLASS[tone])}>
        <RIcon
          aria-hidden
          isSpinning={tone === "neutral"}
          name={icon}
          size="medium"
        />
      </span>
      <Header title={title} description={description} />
    </div>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <RButton
      className={styles.primaryButton}
      onClick={onClick}
      size="medium"
      tone="black"
      variant="secondary"
    >
      Cancel
    </RButton>
  );
}

/** The new account's full address with a copy button */
function AddressField({ address }: { address: string }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timer = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
    } catch (error) {
      console.error("Failed to copy address:", describeError(error));
    }
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>Mavryk address</span>
      <div className={styles.addressField}>
        <span className={styles.addressValue}>{address}</span>
        <button
          aria-label={isCopied ? "Address copied" : "Copy address"}
          className={styles.copyButton}
          onClick={handleCopy}
          type="button"
        >
          <RIcon aria-hidden name={isCopied ? "check" : "copy"} size="small" />
        </button>
      </div>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <RText className={styles.note} color="neutral-700" size="body-sm">
      {children}
    </RText>
  );
}

function ErrorText({
  message,
  centered,
}: {
  message?: string;
  centered?: boolean;
}) {
  if (!message) return null;

  return (
    <p
      className={clsx(styles.error, centered && styles.errorCentered)}
      role="alert"
    >
      <span aria-hidden className={styles.errorDot} />
      {message}
    </p>
  );
}
