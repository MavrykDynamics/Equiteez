/**
 * Security, Backup and Export private key for email wallets. Export private
 * key is live: a confirmation, then Dynamic's own window with the key.
 * Security and Backup are still the Figma copy as is (mock): their statuses
 * are the design's and their buttons do nothing.
 */
import { useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

import { ExportKeyModal } from "./ExportKeyModal";
import styles from "../styles.module.css";

type SecurityRow = {
  title: string;
  status: string;
  tone?: "success" | "warning";
  action: string;
  isPrimary?: boolean;
};

const SECURITY_ROWS: SecurityRow[] = [
  {
    title: "Wallet password",
    status: "Set. You need it to restore your wallet on a new device.",
    tone: "success",
    action: "Change",
  },
  {
    title: "Authenticator app",
    status: "Not set up",
    tone: "warning",
    action: "Set up",
    isPrimary: true,
  },
  {
    title: "Passkeys",
    status: "1 passkey: MacBook Pro, added 2 Nov 2026",
    action: "Manage",
  },
  {
    title: "Trusted devices",
    status: "2 devices, including this one. Revoking all signs you out.",
    action: "Manage",
  },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <RHeading as="h2" className={styles.sectionTitle} size="h6" weight="medium">
      {children}
    </RHeading>
  );
}

export function WalletSecurity() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionIntro}>
        <SectionTitle>Security</SectionTitle>
        <RText color="neutral-700" size="body-s">
          Only features turned on for this project appear here.
        </RText>
      </div>

      <div className={styles.securityList}>
        {SECURITY_ROWS.map((row) => (
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
              size="small"
              tone="black"
              variant={row.isPrimary ? "primary" : "secondary"}
            >
              {row.action}
            </RButton>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WalletBackupAndExport() {
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
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          onContinue={dynamic.revealPrivateKey}
        />
      ) : null}
    </div>
  );
}
