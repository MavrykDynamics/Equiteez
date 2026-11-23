/**
 * Authenticator app → Set up / Manage. No Figma for this window yet: it
 * follows the Wallet page modals. Set up: "Confirm it's you", scan the QR
 * code, enter the first code, save the recovery codes. Manage: remove it with
 * a current code from the app.
 */
import { useEffect, useState, type FormEvent } from "react";
import QRCode from "react-qr-code";

import { CopyButton } from "~/lib/atoms/CopyButton";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
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
    <CustomPopup
      className={styles.modal}
      contentLabel="Authenticator app"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      {/* Mounted only while open: every opening starts from the beginning */}
      <AuthenticatorContent {...props} onClose={onClose} />
    </CustomPopup>
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
  /** codes: null while loading or after a failed load */
  | { name: "recovery-codes"; codes: string[] | null }
  | { name: "manage" };

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
    authenticator ? { name: "manage" } : { name: "starting" }
  );
  const [code, setCode] = useState("");
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
    if (step.name !== "scan" || code.length < CODE_LENGTH) return;

    void run(async () => {
      await verifySetup(step.setup.deviceId, code);
      setCode("");
      setStep({ name: "recovery-codes", codes: null });
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
      else onClose();
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
      onClose();
    }, "We couldn't save that. Try again.");

  const handleRemove = (event: FormEvent) => {
    event.preventDefault();
    if (code.length < CODE_LENGTH) return;

    void run(async () => {
      await remove(code);
      onClose();
    }, "We couldn't remove the authenticator app. Try again.");
  };

  const errorText = error ? (
    <RText className={styles.error} role="alert" size="body-sm">
      {error}
    </RText>
  ) : null;

  return (
    <>
      <div className={styles.closeRow}>
        <button
          aria-label="Close"
          className={styles.closeButton}
          disabled={isWorking}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.heroIcon}>
            <RIcon aria-hidden name="lock" size="medium" />
          </span>
          <div className={styles.headerText}>
            <RHeading className={styles.title} size="h6" weight="medium">
              {step.name === "recovery-codes"
                ? "Save Your Recovery Codes"
                : "Authenticator App"}
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              {step.name === "manage"
                ? "We ask for a code from your authenticator app to confirm it's you."
                : step.name === "recovery-codes"
                  ? "Each code works once, if you lose access to your authenticator app. We won't show them again."
                  : "Use an app such as Google Authenticator, 1Password or Authy to confirm it's you."}
            </RText>
          </div>
        </header>

        {step.name === "starting" ? (
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
            {errorText}
            <div className={styles.actions}>
              <RButton
                className={styles.action}
                onClick={onClose}
                size="medium"
                tone="black"
                variant="secondary"
              >
                Close
              </RButton>
            </div>
          </>
        ) : null}

        {step.name === "scan" ? (
          <form className={styles.codeForm} onSubmit={handleVerify}>
            <div className={styles.qrBlock}>
              <div className={styles.qrCode}>
                <QRCode
                  aria-label="QR code for your authenticator app"
                  role="img"
                  size={160}
                  value={step.setup.uri}
                />
              </div>
              <RText color="neutral-700" size="body-s">
                Can&apos;t scan? Enter this key in the app:
              </RText>
              <CopyButton
                aria-label="Copy the set-up key"
                className={styles.secret}
                mode="reverse"
                text={step.setup.secret}
                type="block"
              >
                <RText size="body-sm" weight="medium">
                  {step.setup.secret}
                </RText>
                <RIcon aria-hidden name="copy" size="small" />
              </CopyButton>
            </div>
            <RText color="neutral-700" size="body-sm">
              Then enter the 6-digit code the app shows.
            </RText>
            <div className={styles.codeBlock}>
              <CodeInput
                invalid={Boolean(error)}
                onChange={setCode}
                value={code}
              />
              {errorText}
            </div>
            <div className={styles.actions}>
              <RButton
                className={styles.action}
                disabled={isWorking}
                onClick={onClose}
                size="medium"
                tone="black"
                type="button"
                variant="secondary"
              >
                Cancel
              </RButton>
              <RButton
                className={styles.action}
                disabled={code.length < CODE_LENGTH || isWorking}
                isLoading={isWorking}
                size="medium"
                tone="black"
                type="submit"
              >
                Turn On
              </RButton>
            </div>
          </form>
        ) : null}

        {step.name === "recovery-codes" && !step.codes ? (
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
            {errorText}
            {error ? (
              <RButton
                className={styles.action}
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
        ) : null}

        {step.name === "recovery-codes" && step.codes ? (
          <>
            <ul className={styles.recoveryCodes}>
              {step.codes.map((recoveryCode) => (
                <li key={recoveryCode}>{recoveryCode}</li>
              ))}
            </ul>
            <CopyButton
              aria-label="Copy all recovery codes"
              className={styles.copyAll}
              mode="reverse"
              text={step.codes.join("\n")}
              type="block"
            >
              <RIcon aria-hidden name="copy" size="small" />
              <RText size="body-sm" weight="medium">
                Copy all codes
              </RText>
            </CopyButton>
            {errorText}
            <RButton
              className={styles.action}
              disabled={isWorking}
              isLoading={isWorking}
              onClick={() => void handleSavedCodes()}
              size="medium"
              tone="black"
            >
              I&apos;ve Saved These Codes
            </RButton>
          </>
        ) : null}

        {step.name === "manage" ? (
          <form className={styles.codeForm} onSubmit={handleRemove}>
            <RText color="neutral-700" size="body-sm">
              To remove it, enter a current 6-digit code from the app.
            </RText>
            <div className={styles.codeBlock}>
              <CodeInput
                invalid={Boolean(error)}
                onChange={setCode}
                value={code}
              />
              {errorText}
            </div>
            <div className={styles.actions}>
              <RButton
                className={styles.action}
                disabled={isWorking}
                onClick={onClose}
                size="medium"
                tone="black"
                type="button"
                variant="secondary"
              >
                Close
              </RButton>
              <RButton
                className={styles.action}
                disabled={code.length < CODE_LENGTH || isWorking}
                isLoading={isWorking}
                size="medium"
                tone="black"
                type="submit"
              >
                Remove
              </RButton>
            </div>
          </form>
        ) : null}
      </div>
    </>
  );
}
