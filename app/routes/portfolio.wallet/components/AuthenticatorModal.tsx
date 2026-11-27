/**
 * Authenticator app → Set up / Manage (Figma 8131:518 "Security –
 * Authenticator App" and "Disable Authenticator App"). Set up: "Confirm it's
 * you", scan the QR code, enter the first code, save the recovery codes, done.
 * Manage: confirm turning it off, enter a current code, done.
 */
import { useEffect, useState, type FormEvent } from "react";
import QRCode from "react-qr-code";

import { CopyButton } from "~/lib/atoms/CopyButton";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  DynamicSessionExpiredError,
  DynamicWrongCodeError,
  IdentityCheckCancelledError,
  IdentityCheckUnavailableError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";
import type { AuthenticatorSetup } from "~/providers/WalletProvider/dynamic/dynamicClient.client";
import {
  CODE_LENGTH,
  CodeInput,
} from "~/templates/ConnectWalletModal/CodeInput";

import type { useAuthenticator } from "./useAuthenticator";
import styles from "./WalletModal.module.css";
import { RPopupHeader } from "~/lib/molecules/RPopupHeader";

import {
  WalletModal,
  WalletModalActions,
  WalletModalCheckbox,
  WalletModalError,
  WalletModalSuccess,
  WalletModalWarning,
} from "./WalletModalParts";

type AuthenticatorModalProps = Omit<
  ReturnType<typeof useAuthenticator>,
  "hasError" | "reload"
> & {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthenticatorModal({
  isOpen,
  onClose,
  ...props
}: AuthenticatorModalProps) {
  return (
    <WalletModal
      isOpen={isOpen}
      label="Authenticator app"
      onRequestClose={onClose}
    >
      {/* Mounted only while open: every opening starts from the beginning */}
      <AuthenticatorContent {...props} onClose={onClose} />
    </WalletModal>
  );
}

const toMessage = (error: unknown, fallback: string) =>
  error instanceof DynamicWrongCodeError ||
  error instanceof DynamicSessionExpiredError ||
  error instanceof IdentityCheckUnavailableError
    ? error.message
    : fallback;

type Step =
  | { name: "starting" }
  | { name: "scan"; setup: AuthenticatorSetup }
  | { name: "verify"; setup: AuthenticatorSetup }
  /** codes: null while loading or after a failed load */
  | { name: "recovery-codes"; codes: string[] | null }
  | { name: "enabled" }
  | { name: "disable" }
  | { name: "disable-code" }
  | { name: "disabled" };

const CODE_HINT =
  "The code refreshes every 30 seconds. Make sure you enter the latest code.";

function AuthenticatorContent({
  authenticator,
  startSetup,
  verifySetup,
  getRecoveryCodes,
  acknowledgeRecoveryCodes,
  remove,
  onClose,
}: Omit<AuthenticatorModalProps, "isOpen">) {
  const [step, setStep] = useState<Step>(() =>
    authenticator ? { name: "disable" } : { name: "starting" }
  );
  const [code, setCode] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up starts at once: "Confirm it's you", then the QR code
  useEffect(() => {
    if (step.name !== "starting") return;

    let isCancelled = false;

    startSetup().then(
      (setup) => {
        if (!isCancelled) setStep({ name: "scan", setup });
      },
      (startError: unknown) => {
        if (isCancelled) return;
        if (startError instanceof IdentityCheckCancelledError) onClose();
        else {
          setError(
            toMessage(startError, "We couldn't start the set-up. Try again.")
          );
        }
      }
    );

    return () => {
      isCancelled = true;
    };
    // Once per opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (next: Step) => {
    setCode("");
    setError(null);
    setStep(next);
  };

  const run = async (task: () => Promise<void>, fallback: string) => {
    setIsWorking(true);
    setError(null);

    try {
      await task();
    } catch (taskError) {
      setError(toMessage(taskError, fallback));
    } finally {
      setIsWorking(false);
    }
  };

  const handleVerify = (event: FormEvent) => {
    event.preventDefault();
    if (step.name !== "verify" || code.length < CODE_LENGTH) return;

    void run(async () => {
      await verifySetup(step.setup.deviceId, code);
      goTo({ name: "recovery-codes", codes: null });
      await loadRecoveryCodes();
    }, "We couldn't turn on the authenticator app. Try again.");
  };

  /**
   * The app is on by now: a failed load keeps this step with "Try again"
   * rather than closing, so the codes are not lost unseen
   */
  const loadRecoveryCodes = async () => {
    setError(null);

    try {
      const codes = await getRecoveryCodes();

      if (codes.length) setStep({ name: "recovery-codes", codes });
      // The project has recovery codes off: nothing to save
      else setStep({ name: "enabled" });
    } catch (loadError) {
      setError(
        toMessage(
          loadError,
          "Your authenticator app is on, but we couldn't load your recovery codes. Try again."
        )
      );
    }
  };

  const handleSavedCodes = () =>
    run(async () => {
      await acknowledgeRecoveryCodes();
      setStep({ name: "enabled" });
    }, "We couldn't save that. Try again.");

  const handleRemove = (event: FormEvent) => {
    event.preventDefault();
    if (code.length < CODE_LENGTH) return;

    void run(async () => {
      await remove(code);
      setStep({ name: "disabled" });
    }, "We couldn't turn off the authenticator app. Try again.");
  };

  if (step.name === "enabled") {
    return (
      <WalletModalSuccess
        description="Your account is now protected with two-factor authentication. You'll need a verification code from your authenticator app when signing in."
        onClose={onClose}
        title="Authenticator Enabled"
      />
    );
  }

  if (step.name === "disabled") {
    return (
      <WalletModalSuccess
        description="Two-factor authentication has been disabled for your account. You no longer need an authenticator code when signing in."
        onClose={onClose}
        title="Authenticator Disabled"
      />
    );
  }

  // The cells, then the hint, or the error in its place
  const codeBlock = (
    <div className={styles.codeBlock}>
      <CodeInput invalid={Boolean(error)} onChange={setCode} value={code} />
      {error ? (
        <WalletModalError message={error} />
      ) : (
        <RText color="neutral-700" size="body-sm">
          {CODE_HINT}
        </RText>
      )}
    </div>
  );

  if (step.name === "starting" || step.name === "scan") {
    return (
      <div className={styles.content}>
        <RPopupHeader
          description="Scan this QR code using your authenticator app to add your Equiteez account."
          onClose={onClose}
          title="Connect Authenticator App"
        />

        {step.name === "scan" ? (
          <>
            <div className={styles.qrBlock}>
              <QRCode
                aria-label="QR code for your authenticator app"
                role="img"
                size={144}
                value={step.setup.uri}
              />
              <div className={styles.keyBlock}>
                <RText size="body-sm">
                  Can&apos;t scan? Enter the key in the app
                </RText>
                <CopyButton
                  aria-label="Copy the set-up key"
                  className={styles.secret}
                  mode="reverse"
                  text={step.setup.secret}
                  type="block"
                >
                  <RText size="body-sm">{step.setup.secret}</RText>
                  <RIcon aria-hidden name="copy" size="small" />
                </CopyButton>
              </div>
            </div>
            <WalletModalWarning title="Do not share your setup key or verification codes with anyone." />
            <WalletModalActions
              confirmLabel="Continue"
              onCancel={onClose}
              onConfirm={() => goTo({ name: "verify", setup: step.setup })}
            />
          </>
        ) : (
          <>
            {error ? null : (
              <RText
                className={styles.empty}
                color="neutral-700"
                size="body-sm"
              >
                Preparing your QR code…
              </RText>
            )}
            <WalletModalError message={error} />
            <RButton
              className={styles.fullAction}
              onClick={onClose}
              size="medium"
              tone="black"
              variant="secondary"
            >
              Close
            </RButton>
          </>
        )}
      </div>
    );
  }

  if (step.name === "verify") {
    return (
      <form className={styles.content} onSubmit={handleVerify}>
        <RPopupHeader
          description="Enter the 6-digit verification code generated by your authenticator app to finish setup."
          isDisabled={isWorking}
          onBack={() => goTo({ name: "scan", setup: step.setup })}
          onClose={onClose}
          title="Verify Your Authenticator"
        />
        {codeBlock}
        <WalletModalActions
          confirmLabel={isWorking ? "Verifying..." : "Verify And Enable"}
          isConfirmDisabled={code.length < CODE_LENGTH}
          isSubmit
          isWorking={isWorking}
          onCancel={onClose}
        />
      </form>
    );
  }

  if (step.name === "recovery-codes") {
    return (
      <div className={styles.content}>
        <RPopupHeader
          description="Save these codes in a secure place. If you lose access to your authenticator app, you can use one of these codes to sign in to your account."
          isDisabled={isWorking}
          onClose={onClose}
          title="Save Your Recovery Codes"
        />

        {step.codes ? (
          <>
            <WalletModalWarning title="Keep the codes safe">
              Each code can only be used once. Anyone with access to these codes
              may be able to access your account.
            </WalletModalWarning>
            <div className={styles.recoveryBlock}>
              <ul className={styles.recoveryCodes}>
                {step.codes.map((recoveryCode) => (
                  <li key={recoveryCode}>{recoveryCode}</li>
                ))}
              </ul>
              <CopyButton
                aria-label="Copy all recovery codes"
                className={styles.copyLink}
                mode="reverse"
                text={step.codes.join("\n")}
                type="block"
              >
                <RIcon aria-hidden name="copy" size="small" />
                <RText size="body-sm" weight="medium">
                  Copy Codes
                </RText>
              </CopyButton>
            </div>
            <WalletModalCheckbox checked={isSaved} onChange={setIsSaved}>
              I have saved my recovery codes in a safe place.
            </WalletModalCheckbox>
            <WalletModalError message={error} />
            <RButton
              className={styles.fullAction}
              disabled={!isSaved || isWorking}
              isLoading={isWorking}
              onClick={() => void handleSavedCodes()}
              size="medium"
              tone="black"
            >
              Continue
            </RButton>
          </>
        ) : (
          <>
            {error ? null : (
              <RText
                className={styles.empty}
                color="neutral-700"
                size="body-sm"
              >
                Loading your recovery codes…
              </RText>
            )}
            <WalletModalError message={error} />
            {error ? (
              <RButton
                className={styles.fullAction}
                disabled={isWorking}
                isLoading={isWorking}
                onClick={() => void run(loadRecoveryCodes, "Try again.")}
                size="medium"
                tone="black"
              >
                Try Again
              </RButton>
            ) : null}
          </>
        )}
      </div>
    );
  }

  if (step.name === "disable") {
    return (
      <div className={styles.content}>
        <RPopupHeader
          description="Disabling two-factor authentication will remove the additional security layer from your account. You'll no longer need an authenticator code when signing in."
          onClose={onClose}
          title="Disable Authenticator?"
        />
        <WalletModalWarning title="Your account will be less secure">
          We recommend keeping two-factor authentication enabled to help protect
          your account.
        </WalletModalWarning>
        <WalletModalActions
          confirmLabel="Disable"
          onCancel={onClose}
          onConfirm={() => goTo({ name: "disable-code" })}
        />
      </div>
    );
  }

  return (
    <form className={styles.content} onSubmit={handleRemove}>
      <RPopupHeader
        description="Enter the verification code from your authenticator app to disable two-factor authentication."
        isDisabled={isWorking}
        onBack={() => goTo({ name: "disable" })}
        onClose={onClose}
        title="Verify Your Identity"
      />
      {codeBlock}
      <WalletModalActions
        confirmLabel="Confirm And Disable"
        isConfirmDisabled={code.length < CODE_LENGTH}
        isSubmit
        isWorking={isWorking}
        onCancel={onClose}
      />
    </form>
  );
}
