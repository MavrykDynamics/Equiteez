import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

import styles from "./BlockchainTab.module.css";

type BlockchainDetail = {
  isLink?: boolean;
  label: string;
  value: string;
};

const blockchainDetails: BlockchainDetail[] = [
  { isLink: true, label: "Token Contract", value: "KT11PDIIV...1tbo" },
  { label: "Token Standard", value: "MRC-30" },
  { label: "Token Supply", value: "496,767" },
  { label: "Holders", value: "2,091" },
  { label: "Asset Issuer", value: "Equiteez Issuance Ltd" },
  { isLink: true, label: "Issuer Address", value: "mv1Qk...8fRt" },
  { isLink: true, label: "Whitelist Registry", value: "KT1WHT...a91c" },
  {
    isLink: true,
    label: "Distribution Contract",
    value: "KT1DIS...6b2e",
  },
  { label: "Price Oracle", value: "Maven Finance" },
  { label: "Chain", value: "Mavryk Mainnet" },
];

function BlockchainDetailList() {
  return (
    <dl className={styles.detailList}>
      {blockchainDetails.map(({ isLink, label, value }) => (
        <div className={styles.detail} key={label}>
          <dt>
            <RText color="neutral-700" size="body-sm">
              {label}
            </RText>
          </dt>
          <dd>
            <RText
              className={isLink ? styles.linkValue : undefined}
              color="neutral-black"
              size="body-sm"
            >
              {value}
            </RText>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function BlockchainTab({ asset }: { asset: AssetType }) {
  return (
    <div className={styles.wrapper}>
      <section className={styles.network} aria-labelledby="network-heading">
        <RHeading id="network-heading" size="h7" weight="medium">
          Mavryk Network
        </RHeading>
        <BlockchainDetailList />
      </section>

      <div aria-hidden="true" className={styles.divider} />

      <section className={styles.utility} aria-labelledby="utility-heading">
        <div className={styles.utilityContent}>
          <RHeading id="utility-heading" size="h7" weight="medium">
            Use It Elsewhere
          </RHeading>
          <RText color="neutral-700" size="body-sm">
            The token is a standard Mavryk asset. Bridge it, swap it, or post it
            as collateral.
          </RText>
        </div>

        <div className={styles.actions}>
          <RButton
            className={styles.action}
            iconRight={<RIcon aria-hidden name="arrow-long-up-right" />}
            size="medium"
            tone="black"
          >
            Open mDEX
          </RButton>
          <RButton
            className={styles.action}
            iconRight={<RIcon aria-hidden name="arrow-long-up-right" />}
            size="medium"
            tone="black"
            variant="secondary"
          >
            Open mBridge
          </RButton>
        </div>
      </section>
    </div>
  );
}
