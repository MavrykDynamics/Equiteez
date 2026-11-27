/**
 * "Signing key" card: the connected wallet's address, public key, provider,
 * login email (email wallets), network and KYC status, all from the live
 * session, plus Sign Out.
 */
import type { ReactNode } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { NETWORK_LABEL } from "~/layouts/PageLayout/WalletMenu/DynamicWalletMenu/parts";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { OperationHash } from "~/routes/portfolio.activity/components/TransactionHistoryTab/OperationHash";

import styles from "../styles.module.css";

const PROVIDER_LABEL = {
  dynamic: "Dynamic (email sign-in)",
  mavryk_extension: "Mavryk Wallet",
} as const;

export function SigningKey() {
  const { identity } = useWalletContext();
  const { userAddress, signOut } = useUserContext();
  const address = identity?.address ?? userAddress;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <RHeading
          as="h2"
          className={styles.sectionTitle}
          size="h6"
          weight="medium"
        >
          Signing key
        </RHeading>
      </div>

      <dl className={styles.details}>
        {address ? (
          <Detail label="Address">
            <OperationHash
              copyLabel="Copy address"
              display="full"
              operationHash={address}
            />
          </Detail>
        ) : null}
        {identity?.publicKey ? (
          <Detail label="Public key">
            <OperationHash
              copyLabel="Copy public key"
              display="full"
              operationHash={identity.publicKey}
              withNexusLink={false}
            />
          </Detail>
        ) : null}
        {identity ? (
          <Detail label="Provider">{PROVIDER_LABEL[identity.provider]}</Detail>
        ) : null}
        {identity?.email ? (
          <Detail label="Login email">{identity.email}</Detail>
        ) : null}
        <Detail label="Network">{NETWORK_LABEL}</Detail>
      </dl>

      <div className={styles.sectionFooter}>
        <RButton
          iconLeft={<RIcon aria-hidden="true" name="sign-out" />}
          onClick={() => void signOut()}
          size="medium"
          tone="black"
          variant="secondary"
        >
          Sign Out
        </RButton>
      </div>
    </section>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.detail}>
      <dt>
        <RText color="neutral-700" size="body-sm">
          {label}
        </RText>
      </dt>
      <dd>
        <RText size="body-sm">{children}</RText>
      </dd>
    </div>
  );
}
