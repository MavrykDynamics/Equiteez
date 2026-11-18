/**
 * Passkeys → Manage: the email wallet's passkeys with Remove, and Add passkey,
 * which runs the browser's own prompt (Touch ID, Face ID, screen lock). No
 * Figma for this window yet: it follows the Wallet page modals.
 */
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import { formatPasskeyDate, type usePasskeys } from "./usePasskeys";
import styles from "./WalletModal.module.css";

type PasskeysModalProps = ReturnType<typeof usePasskeys> & {
  isOpen: boolean;
  onClose: () => void;
};

export function PasskeysModal({
  isOpen,
  onClose,
  passkeys,
  error,
  isAdding,
  removingId,
  add,
  remove,
}: PasskeysModalProps) {
  const isBusy = isAdding || removingId !== null;

  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Passkeys"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <RHeading className={styles.title} size="h6" weight="medium">
              Passkeys
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              A passkey confirms it&apos;s you with your device&apos;s Touch ID,
              Face ID or screen lock.
            </RText>
          </div>
        </header>

        {passkeys === null ? (
          error ? null : (
            <RText className={styles.empty} color="neutral-700" size="body-sm">
              Loading your passkeys…
            </RText>
          )
        ) : passkeys.length ? (
          <ul className={styles.list}>
            {passkeys.map((passkey) => (
              <li className={styles.listItem} key={passkey.id}>
                <div>
                  <RText size="body-sm" weight="medium">
                    {passkey.name ?? "Passkey"}
                  </RText>
                  <RText color="neutral-700" size="body-s">
                    Added {formatPasskeyDate(passkey.createdAt)}
                  </RText>
                </div>
                <RButton
                  disabled={isBusy}
                  isLoading={removingId === passkey.id}
                  onClick={() => void remove(passkey.id)}
                  size="small"
                  tone="black"
                  variant="secondary"
                >
                  Remove
                </RButton>
              </li>
            ))}
          </ul>
        ) : (
          <RText className={styles.empty} color="neutral-700" size="body-sm">
            No passkeys yet.
          </RText>
        )}

        {error ? (
          <RText className={styles.error} role="alert" size="body-sm">
            {error}
          </RText>
        ) : null}

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
          <RButton
            className={styles.action}
            disabled={isBusy || passkeys === null}
            isLoading={isAdding}
            onClick={() => void add()}
            size="medium"
            tone="black"
          >
            Add passkey
          </RButton>
        </div>
      </div>
    </CustomPopup>
  );
}
