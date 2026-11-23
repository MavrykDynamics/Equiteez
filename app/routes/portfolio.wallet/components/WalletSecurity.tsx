/**
 * Security, Backup and Export private key for email wallets. Live: Wallet
 * password (set or change), Passkeys (list, add, remove through Dynamic) and
 * Export private key (a confirmation, "Confirm it's you", then the key in
 * Dynamic's frame). Authenticator app and Backup are still the Figma copy as
 * is (mock): their statuses are the design's and their buttons do nothing.
 * Trusted devices are not offered: device registration is off for Equiteez.
 */
import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

import { ExportKeyModal } from "./ExportKeyModal";
import { PasskeysModal } from "./PasskeysModal";
import { describePasskeys, usePasskeys } from "./usePasskeys";
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

/** Mock row between the live ones, in the Figma order */
const MOCK_AUTHENTICATOR_ROW: SecurityRow = {
  title: "Authenticator app",
  status: "Not set up",
  tone: "warning",
  action: "Set up",
  isPrimary: true,
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
  const [isPasskeysOpen, setIsPasskeysOpen] = useState(false);
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
    MOCK_AUTHENTICATOR_ROW,
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
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className={styles.columns}>
      <section className={`${styles.section} ${styles.column}`}>
        <SectionTitle>Backup</SectionTitle>
        <span
          className={`${styles.status} ${styles.statusLarge}`}
          data-tone="warning"
        >
          <RText size="body-sm" weight="medium">
            Not backed up
          </RText>
        </span>
        <RText color="neutral-700" size="body-sm">
          Save an encrypted recovery file to your Google Drive so you can
          restore access on a new device.
        </RText>
        <div className={styles.infoMessage}>
          <RIcon aria-hidden="true" name="info-circle" size="small" />
          <RText size="body-sm">
            Google will ask you to allow one file in your Drive, then bring you
            back here to finish.
          </RText>
        </div>
        <RButton className={styles.fullButton} size="medium" tone="black">
          Back up to Google Drive
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
