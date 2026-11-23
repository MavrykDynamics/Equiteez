/**
 * Security, Backup and Export private key for email wallets: Wallet password
 * (set or change), Authenticator app (set up with a QR code, remove with a
 * code), Passkeys (list, add, remove through Dynamic), Backup to Google Drive
 * and Export private key (a confirmation, "Confirm it's you", then the key in
 * Dynamic's frame).
 * Trusted devices are not offered: device registration is off for Equiteez.
 */
import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

import { AuthenticatorModal } from "./AuthenticatorModal";
import { ExportKeyModal } from "./ExportKeyModal";
import { GoogleDriveBackupModal } from "./GoogleDriveBackupModal";
import { PasskeysModal } from "./PasskeysModal";
import { describeAuthenticator, useAuthenticator } from "./useAuthenticator";
import { describePasskeys, usePasskeys } from "./usePasskeys";
import { useGoogleDriveBackup } from "./useGoogleDriveBackup";
import { describeWalletPassword, useWalletPassword } from "./useWalletPassword";
import { WalletPasswordModal } from "./WalletPasswordModal";
import styles from "../styles.module.css";

type SecurityRow = {
  title: string;
  status: string;
  tone?: "success" | "warning";
  action: string;
  isPrimary?: boolean;
  isDisabled?: boolean;
  onAction?: () => void;
};

/** Security, Backup and Export: they share the wallet password state */
export function EmailWalletSettings() {
  const password = useWalletPassword();

  return (
    <>
      <WalletSecurity password={password} />
      <WalletBackupAndExport hasPassword={password.hasPassword === true} />
    </>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <RHeading as="h2" className={styles.sectionTitle} size="h6" weight="medium">
      {children}
    </RHeading>
  );
}

function WalletSecurity({
  password,
}: {
  password: ReturnType<typeof useWalletPassword>;
}) {
  const passkeys = usePasskeys();
  const authenticator = useAuthenticator();
  const [isPasskeysOpen, setIsPasskeysOpen] = useState(false);
  const [isAuthenticatorOpen, setIsAuthenticatorOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const hasPassword = password.hasPassword === true;

  const rows: SecurityRow[] = [
    {
      title: "Wallet password",
      ...describeWalletPassword(password.hasPassword, password.hasError),
      action: hasPassword ? "Change" : "Set up",
      isPrimary: password.hasPassword === false,
      isDisabled: password.hasPassword === null,
      onAction: () => setIsPasswordOpen(true),
    },
    {
      title: "Authenticator app",
      ...describeAuthenticator(
        authenticator.authenticator,
        authenticator.hasError
      ),
      action: authenticator.authenticator ? "Manage" : "Set up",
      isPrimary: authenticator.authenticator === null,
      isDisabled: authenticator.authenticator === undefined,
      onAction: () => setIsAuthenticatorOpen(true),
    },
    {
      title: "Passkeys",
      status: describePasskeys(passkeys.passkeys, Boolean(passkeys.error)),
      action: "Manage",
      onAction: () => setIsPasskeysOpen(true),
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.sectionIntro}>
        <SectionTitle>Security</SectionTitle>
        <RText color="neutral-700" size="body-s">
          Only features turned on for this project appear here.
        </RText>
      </div>

      <div className={styles.securityList}>
        {rows.map((row) => (
          <div className={styles.securityRow} key={row.title}>
            <div>
              <RText size="body-sm" weight="medium">
                {row.title}
              </RText>
              <RText
                className={row.tone ? styles.status : undefined}
                color="neutral-700"
                data-tone={row.tone}
                size="body-s"
              >
                {row.status}
              </RText>
            </div>
            <RButton
              disabled={row.isDisabled}
              onClick={row.onAction}
              size="small"
              tone="black"
              variant={row.isPrimary ? "primary" : "secondary"}
            >
              {row.action}
            </RButton>
          </div>
        ))}
      </div>

      <PasskeysModal
        {...passkeys}
        isOpen={isPasskeysOpen}
        onClose={() => setIsPasskeysOpen(false)}
      />
      <AuthenticatorModal
        acknowledgeRecoveryCodes={authenticator.acknowledgeRecoveryCodes}
        authenticator={authenticator.authenticator}
        isOpen={isAuthenticatorOpen}
        onClose={() => setIsAuthenticatorOpen(false)}
        remove={authenticator.remove}
        startSetup={authenticator.startSetup}
        verifySetup={authenticator.verifySetup}
      />
      <WalletPasswordModal
        hasPassword={hasPassword}
        isOpen={isPasswordOpen}
        markPasswordSet={password.markPasswordSet}
        onClose={() => setIsPasswordOpen(false)}
        save={password.save}
      />
    </section>
  );
}

function WalletBackupAndExport({ hasPassword }: { hasPassword: boolean }) {
  const { dynamic } = useWalletContext();
  const backup = useGoogleDriveBackup();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  return (
    <div className={styles.columns}>
      <section className={`${styles.section} ${styles.column}`}>
        <SectionTitle>Backup</SectionTitle>
        <span
          className={`${styles.status} ${styles.statusLarge}`}
          data-tone={backup.isBackedUp ? "success" : "warning"}
        >
          <RText size="body-sm" weight="medium">
            {backup.isBackedUp ? "Backed up to Google Drive" : "Not backed up"}
          </RText>
        </span>
        <RText color="neutral-700" size="body-sm">
          Save an encrypted recovery file to your Google Drive so you can
          restore access on a new device.
        </RText>
        <div className={styles.infoMessage}>
          <RIcon aria-hidden="true" name="info-circle" size="small" />
          <RText size="body-sm">
            Google will ask you to allow one file in your Drive. Tick both
            Google Drive boxes.
          </RText>
        </div>
        <RButton
          className={styles.fullButton}
          disabled={!dynamic}
          onClick={() => setIsBackupOpen(true)}
          size="medium"
          tone="black"
          variant={backup.isBackedUp ? "secondary" : "primary"}
        >
          {backup.isBackedUp ? "Back up again" : "Back up to Google Drive"}
        </RButton>
      </section>

      <section className={`${styles.section} ${styles.column}`}>
        <SectionTitle>Export private key</SectionTitle>
        <RText color="neutral-700" size="body-sm">
          For moving to another wallet. Anyone who has this key controls your
          Mavryk address and everything in it.
        </RText>
        <div className={styles.spacer} />
        <RButton
          className={styles.fullButton}
          disabled={!dynamic}
          onClick={() => setIsExportOpen(true)}
          size="medium"
          tone="black"
          variant="secondary"
        >
          Export private key
        </RButton>
      </section>

      <GoogleDriveBackupModal
        accessSource={backup.accessSource}
        backUp={backup.backUp}
        hasPassword={hasPassword}
        isAvailable={backup.isAvailable}
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        prepare={backup.prepare}
      />

      {dynamic ? (
        <ExportKeyModal
          hasPassword={hasPassword}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          onContinue={dynamic.revealPrivateKey}
        />
      ) : null}
    </div>
  );
}
