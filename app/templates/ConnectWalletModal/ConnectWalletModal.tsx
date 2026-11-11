/**
 * Sign-in modal: Mavryk Wallet (extension) or an email wallet (Dynamic).
 * Functional first, in the app's current style; the designer refines it.
 *
 * Email flow: email → code → wallet set-up → RWA sign-in, each step with a
 * recoverable error. Closing the modal never deletes a wallet.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { HashShortView } from "~/lib/atoms/HashShortView";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { useIsMobileViewport } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import type { DynamicWalletOption } from "~/providers/WalletProvider/dynamic/dynamic.errors";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

import {
  describeConnectError,
  isValidEmail,
  type ConnectStage,
} from "./connectWalletErrors";
import styles from "./ConnectWalletModal.module.css";

const RESEND_COOLDOWN_MS = 30_000;

export type ConnectMethod = "email";

type Step =
  | { name: "choose" }
  | { name: "email"; error?: string }
  | { name: "code"; error?: string }
  | { name: "working"; label: string }
  | { name: "select-wallet"; wallets: DynamicWalletOption[] }
  | { name: "failed"; message: string };

type ConnectWalletModalProps = {
  isOpen: boolean;
  /** Skip the chooser and go straight to the email wallet */
  initialMethod?: ConnectMethod;
  onClose: () => void;
};

export function ConnectWalletModal({
  isOpen,
  initialMethod,
  onClose,
}: ConnectWalletModalProps) {
  const { dynamic, phase, identity } = useWalletContext();
  const { connect, connectWithWallet } = useUserContext();
  const isMobile = useIsMobileViewport();

  const [step, setStep] = useState<Step>({ name: "choose" });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
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

  /** Connects with `connectStep`, then signs in; closes on success. */
  const connectAndSignIn = useCallback(
    async ({
      connectStep,
      stage,
      label,
      onError,
    }: {
      connectStep: () => Promise<unknown>;
      /** Read on failure: a step can move on, e.g. once a code is accepted */
      stage: ConnectStage | (() => ConnectStage);
      label: string;
      onError: (message: string) => Step;
    }) => {
      const run = nextRun();
      let needsEmail = false;

      setStep({ name: "working", label });

      try {
        await connectWithWallet(async () => {
          const connected = await connectStep();
          needsEmail = connected === "needs-email";
          return !needsEmail;
        });
        if (!isCurrent(run)) return;

        if (needsEmail) setStep({ name: "email" });
        else close();
      } catch (error) {
        if (!isCurrent(run)) return;

        const view = describeConnectError(
          error,
          typeof stage === "function" ? stage() : stage
        );

        setStep(
          view.kind === "select-wallet"
            ? { name: "select-wallet", wallets: view.wallets }
            : onError(view.message)
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [close, connectWithWallet]
  );

  /** Uses a live Dynamic session if there is one, otherwise asks for email. */
  const startEmail = useCallback(() => {
    if (!dynamic) return;

    void connectAndSignIn({
      connectStep: () => dynamic.start(),
      stage: "connect",
      label: "Opening your email wallet…",
      onError: (message) => ({ name: "failed", message }),
    });
  }, [connectAndSignIn, dynamic]);

  // Fresh state every time the modal opens
  useEffect(() => {
    if (!isOpen) return;

    setCode("");
    setStep({ name: "choose" });
    if (initialMethod === "email") startEmail();
    // Only on open: startEmail changes with wallet state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMethod]);

  // Move focus to the field of the email and code steps
  useEffect(() => {
    if (step.name === "email" || step.name === "code") {
      contentRef.current?.querySelector("input")?.focus();
    }
  }, [step.name]);

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
      .catch(() => console.error("Failed to connect wallet."));
  };

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!dynamic) return;

    if (!isValidEmail(email)) {
      setStep({ name: "email", error: "Enter a valid email address." });
      return;
    }

    const run = nextRun();
    setStep({ name: "working", label: "Sending your code…" });

    try {
      const result = await dynamic.sendOtp(email);
      if (!isCurrent(run)) return;

      if (result === "already-authenticated") {
        startEmail();
        return;
      }

      setCode("");
      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
      setNow(Date.now());
      setStep({ name: "code" });
    } catch (error) {
      if (!isCurrent(run)) return;

      const view = describeConnectError(error, "email");
      setStep({
        name: "email",
        error: view.kind === "message" ? view.message : undefined,
      });
    }
  };

  const submitCode = (event: FormEvent) => {
    event.preventDefault();
    if (!dynamic || !code.trim()) return;

    // Dynamic accepts a code once. A failure after that (network, wallet,
    // RWA sign-in) must not send the user back to re-enter a used-up code:
    // "Try again" reopens the wallet from the live session instead.
    let codeAccepted = false;

    void connectAndSignIn({
      connectStep: () =>
        dynamic.verifyOtp(code, () => {
          codeAccepted = true;
        }),
      stage: () => (codeAccepted ? "connect" : "code"),
      label: "Checking your code…",
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

  const selectWallet = (walletId: string) => {
    if (!dynamic) return;

    void connectAndSignIn({
      connectStep: () => dynamic.selectWallet(walletId),
      stage: "connect",
      label: "Opening your wallet…",
      onError: (message) => ({ name: "failed", message }),
    });
  };

  const workingLabel =
    step.name !== "working"
      ? ""
      : phase === "connecting"
        ? "Setting up your wallet…"
        : identity
          ? "Signing in to Equiteez…"
          : step.label;

  const resendSeconds = Math.max(
    0,
    Math.ceil((resendAvailableAt - now) / 1000)
  );

  return (
    <CustomPopup
      className={isMobile ? styles.sheet : styles.modal}
      contentLabel="Connect wallet"
      contentPosition={isMobile ? "bottom" : "center"}
      isOpen={isOpen}
      onRequestClose={close}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close"
          className={styles.closeButton}
          onClick={close}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div className={styles.content} ref={contentRef}>
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
              title="Sign in with email"
              description="We'll send you a code. Your wallet is created on first sign-in."
            />
            <RInput
              aria-label="Email"
              autoComplete="email"
              className={styles.input}
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
            <ErrorText message={step.error} />
            <RButton
              className={styles.primaryButton}
              disabled={!email.trim()}
              size="medium"
              tone="black"
              type="submit"
              variant="primary"
            >
              Send code
            </RButton>
            <TextButton onClick={() => setStep({ name: "choose" })}>
              Back
            </TextButton>
          </form>
        )}

        {step.name === "code" && (
          <form className={styles.form} noValidate onSubmit={submitCode}>
            <Header
              title="Enter your code"
              description={`We sent a code to ${email.trim()}.`}
            />
            <RInput
              aria-label="Verification code"
              autoComplete="one-time-code"
              className={styles.input}
              inputMode="numeric"
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              value={code}
            />
            <ErrorText message={step.error} />
            <RButton
              className={styles.primaryButton}
              disabled={!code.trim()}
              size="medium"
              tone="black"
              type="submit"
              variant="primary"
            >
              Continue
            </RButton>
            <div className={styles.linkRow}>
              <TextButton disabled={resendSeconds > 0} onClick={resendCode}>
                {resendSeconds > 0
                  ? `Resend code in ${resendSeconds}s`
                  : "Resend code"}
              </TextButton>
              <TextButton onClick={() => setStep({ name: "email" })}>
                Change email
              </TextButton>
            </div>
          </form>
        )}

        {step.name === "working" && (
          <div aria-live="polite" className={styles.working}>
            <RIcon name="loading" size="medium" />
            <RText size="body-sm">{workingLabel}</RText>
            <TextButton onClick={close}>Cancel</TextButton>
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
                  key={wallet.walletId}
                  onClick={() => selectWallet(wallet.walletId)}
                  title={<HashShortView hash={wallet.address} />}
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
              onClick={startEmail}
              size="medium"
              tone="black"
              variant="primary"
            >
              Try again
            </RButton>
            <TextButton onClick={() => setStep({ name: "choose" })}>
              Use another way
            </TextButton>
          </div>
        )}
      </div>
    </CustomPopup>
  );
}

function Header({
  title,
  description,
}: {
  title: string;
  description: string;
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
  onClick,
}: {
  title: React.ReactNode;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button className={styles.option} onClick={onClick} type="button">
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
  children: React.ReactNode;
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

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className={styles.error} role="alert">
      {message}
    </p>
  );
}
