/**
 * Passkeys (Figma 8131:518 "Security – Passkey"): Set Up A Passkey when there
 * is none, Manage Passkeys otherwise; Remove asks first; adding and removing
 * end on a success screen. Adding runs the browser's own prompt (Touch ID,
 * Face ID, screen lock); "Confirm it's you" is ConfirmIdentityModal.
 */
import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { formatDayMonthYear } from "~/lib/utils/date";

import type { DynamicPasskey, usePasskeys } from "./usePasskeys";
import styles from "./WalletModal.module.css";
import { RPopupHeader } from "~/lib/molecules/RPopupHeader";

import {
  WalletModal,
  WalletModalActions,
  WalletModalError,
  WalletModalSuccess,
} from "./WalletModalParts";

type PasskeysModalProps = ReturnType<typeof usePasskeys> & {
  isOpen: boolean;
  onClose: () => void;
};

export function PasskeysModal({
  isOpen,
  onClose,
  ...props
}: PasskeysModalProps) {
  return (
    <WalletModal isOpen={isOpen} label="Passkeys" onRequestClose={onClose}>
      {/* Mounted only while open: every opening starts on the list */}
      <PasskeysContent {...props} onClose={onClose} />
    </WalletModal>
  );
}

type Step =
  | { name: "list" }
  | { name: "added" }
  | { name: "remove"; passkey: DynamicPasskey; back: "list" | "added" }
  | { name: "removed" };

const newest = (passkeys: DynamicPasskey[]) =>
  passkeys.reduce<DynamicPasskey | null>(
    (last, passkey) =>
      !last || passkey.createdAt > last.createdAt ? passkey : last,
    null
  );

function PasskeysContent({
  onClose,
  passkeys,
  error,
  isAdding,
  removingId,
  add,
  remove,
}: Omit<PasskeysModalProps, "isOpen">) {
  const [step, setStep] = useState<Step>({ name: "list" });
  const isBusy = isAdding || removingId !== null;

  const handleAdd = async () => {
    if (await add()) setStep({ name: "added" });
  };

  const handleRemove = async (passkeyId: string) => {
    if (await remove(passkeyId)) setStep({ name: "removed" });
  };

  const askToRemove = (passkey: DynamicPasskey, back: "list" | "added") =>
    setStep({ name: "remove", passkey, back });

  const addAnother = (
    <div className={styles.actions}>
      <RButton
        className={styles.action}
        disabled={isBusy || passkeys === null}
        isLoading={isAdding}
        onClick={() => void handleAdd()}
        size="medium"
        tone="black"
        variant="secondary"
      >
        Add Another Passkey
      </RButton>
      <RButton
        className={styles.action}
        disabled={isAdding}
        onClick={onClose}
        size="medium"
        tone="black"
      >
        OK
      </RButton>
    </div>
  );

  if (step.name === "removed") {
    return (
      <WalletModalSuccess
        description="Your passkey has been removed from your account."
        onClose={onClose}
        title="Passkey Removed"
      />
    );
  }

  if (step.name === "added") {
    const added = passkeys ? newest(passkeys) : null;

    return (
      <WalletModalSuccess
        actions={
          <>
            <WalletModalError message={error} />
            {addAnother}
          </>
        }
        description="Your passkey has been created. You can now use it to securely sign in to or verify your identity on Equiteez."
        onClose={onClose}
        title="Passkey Added"
      >
        {added ? (
          <PasskeyCard
            onRemove={() => askToRemove(added, "added")}
            passkey={added}
          />
        ) : null}
      </WalletModalSuccess>
    );
  }

  if (step.name === "remove") {
    return (
      <div className={styles.content}>
        <RPopupHeader
          description="Are you sure you want to remove this passkey? You will no longer be able to use it to sign in."
          isDisabled={isBusy}
          onBack={() =>
            setStep(
              step.back === "added" ? { name: "added" } : { name: "list" }
            )
          }
          onClose={onClose}
          title="Remove Passkey?"
        />
        <PasskeyCard passkey={step.passkey} />
        <WalletModalError message={error} />
        <WalletModalActions
          confirmLabel="Confirm And Remove"
          isWorking={removingId === step.passkey.id}
          onCancel={onClose}
          onConfirm={() => void handleRemove(step.passkey.id)}
        />
      </div>
    );
  }

  // No passkeys yet: set one up
  if (passkeys?.length === 0) {
    return (
      <div className={styles.content}>
        <RPopupHeader
          description="Create a passkey to securely access your account using your device's biometrics, PIN, or screen lock."
          isDisabled={isAdding}
          onClose={onClose}
          title="Set Up A Passkey"
        />
        <WalletModalError message={error} />
        <WalletModalActions
          confirmLabel="Create Passkey"
          isWorking={isAdding}
          onCancel={onClose}
          onConfirm={() => void handleAdd()}
        />
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <RPopupHeader
        description="Review and manage your saved passkeys"
        onClose={onClose}
        title="Manage Passkeys"
      />
      {passkeys === null ? (
        error ? null : (
          <RText className={styles.empty} color="neutral-700" size="body-sm">
            Loading your passkeys…
          </RText>
        )
      ) : (
        <ul className={styles.list}>
          {passkeys.map((passkey) => (
            <li key={passkey.id}>
              <PasskeyCard
                isDisabled={isBusy}
                onRemove={() => askToRemove(passkey, "list")}
                passkey={passkey}
              />
            </li>
          ))}
        </ul>
      )}
      <WalletModalError message={error} />
      {addAnother}
    </div>
  );
}

function PasskeyCard({
  passkey,
  isDisabled = false,
  onRemove,
}: {
  passkey: DynamicPasskey;
  isDisabled?: boolean;
  /** Without it the card has no Remove button */
  onRemove?: () => void;
}) {
  return (
    <div className={styles.passkeyCard}>
      <div>
        <RText size="body-sm" weight="medium">
          {passkey.name ?? "Passkey"}
        </RText>
        <RText color="neutral-700" size="body-s">
          Added {formatDayMonthYear(passkey.createdAt)}
        </RText>
      </div>
      {onRemove ? (
        <RButton
          disabled={isDisabled}
          onClick={onRemove}
          size="small"
          tone="black"
          variant="secondary"
        >
          Remove
        </RButton>
      ) : null}
    </div>
  );
}
