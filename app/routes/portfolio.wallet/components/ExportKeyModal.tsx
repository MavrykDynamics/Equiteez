/**
 * "Export Private Key" (Figma 8574:82510 "Security – Private Key"). Continue,
 * once the user takes responsibility for the key, runs "Confirm it's you"
 * and then shows the private key in an isolated frame Dynamic injects into
 * this modal ("Your Private Key"): Equiteez never sees it, so the key can't
 * have our own Copy button.
 */
import { useRef, useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import {
  DynamicSessionExpiredError,
  DynamicWrongPasswordError,
  IdentityCheckCancelledError,
  IdentityCheckUnavailableError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";

import styles from "./WalletModal.module.css";
import {
  PasswordField,
  WalletModal,
  WalletModalActions,
  WalletModalCheckbox,
  WalletModalError,
  WalletModalHeader,
  WalletModalWarning,
} from "./WalletModalParts";

type ExportKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** The wallet has a password: Dynamic needs it to show the key */
  hasPassword?: boolean;
  /** Shows the key in Dynamic's frame inside `displayContainer` */
  onContinue: (
    displayContainer: HTMLElement,
    password?: string
  ) => Promise<void>;
};

export function ExportKeyModal({
  isOpen,
  hasPassword = false,
  onClose,
  onContinue,
}: ExportKeyModalProps) {
  return (
    <WalletModal
      isOpen={isOpen}
      label="Export private key"
      onRequestClose={onClose}
    >
      {/* Mounted only while open: every opening starts unconfirmed */}
      <ExportKeyContent
        hasPassword={hasPassword}
        onClose={onClose}
        onContinue={onContinue}
      />
    </WalletModal>
  );
}

function ExportKeyContent({
  hasPassword,
  onClose,
  onContinue,
}: Omit<ExportKeyModalProps, "isOpen">) {
  const [password, setPassword] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isKeyShown, setIsKeyShown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Dynamic injects the frame with the key here; mounted from the start so
  // the same node is there when the key arrives
  const keyFrameRef = useRef<HTMLDivElement>(null);

  const handleContinue = async () => {
    const keyFrame = keyFrameRef.current;

    if (!keyFrame) return;

    setIsOpening(true);
    setError(null);

    try {
      keyFrame.replaceChildren();
      await onContinue(keyFrame, hasPassword ? password : undefined);
      setPassword("");
      setIsKeyShown(true);
    } catch (openError) {
      keyFrame.replaceChildren();
      // Cancelled "Confirm it's you": stay here, ready to try again
      if (!(openError instanceof IdentityCheckCancelledError)) {
        setError(
          openError instanceof DynamicSessionExpiredError ||
            openError instanceof DynamicWrongPasswordError ||
            openError instanceof IdentityCheckUnavailableError
            ? openError.message
            : "Couldn't show your key. Please try again."
        );
      }
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className={styles.content}>
      {isKeyShown ? (
        <>
          <WalletModalHeader
            description="Your private key is ready. Copy it and store it somewhere safe. Never share it with anyone."
            onClose={onClose}
            title="Your Private Key"
          />
          <WalletModalWarning title="Keep your Private Key secure">
            Anyone with your private key can access and control your wallet.
            Keep it private and secure.
          </WalletModalWarning>
        </>
      ) : (
        <>
          <WalletModalHeader
            description="Your private key gives full access to your wallet and all its assets. Make sure you understand how to keep it safe before proceeding."
            isDisabled={isOpening}
            onClose={onClose}
            title="Export Private Key"
          />
          <WalletModalWarning title="Keep your Private Key secure">
            Never share your private key with anyone or store it in an unsecured
            location. Anyone with access to it can fully control your wallet and
            its funds.
          </WalletModalWarning>
          <WalletModalCheckbox checked={isConfirmed} onChange={setIsConfirmed}>
            I understand the risks and will keep my private key safe.
          </WalletModalCheckbox>
          {hasPassword ? (
            <PasswordField
              autoComplete="current-password"
              label="Wallet Password"
              onChange={setPassword}
              placeholder="Enter Wallet Password"
              value={password}
            />
          ) : null}
          <WalletModalError message={error} />
          <WalletModalActions
            confirmLabel="Continue"
            isConfirmDisabled={!isConfirmed || (hasPassword && !password)}
            isWorking={isOpening}
            onCancel={onClose}
            onConfirm={() => void handleContinue()}
          />
        </>
      )}

      {/* Dynamic's frame with the key: mounted from the start so the same
          node is there when the key arrives */}
      <div
        className={isKeyShown ? styles.keyFrame : undefined}
        hidden={!isKeyShown}
        ref={keyFrameRef}
      />

      {isKeyShown ? (
        <RButton
          className={styles.fullAction}
          onClick={onClose}
          size="medium"
          tone="black"
        >
          OK
        </RButton>
      ) : null}
    </div>
  );
}
