import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

import styles from "./BlockchainTab.module.css";
import { useMemo } from "react";
import Money from "~/lib/atoms/Money";
import HashShortView from "~/lib/atoms/HashShortView";

type BlockchainDetail = {
  isLink?: boolean;
  label: string;
  value: React.ReactNode;
};

function BlockchainDetailList({ asset }: { asset: AssetType }) {
  const tokenSupply = asset.finance.max_supply ?? asset.total_supply;

  const blockchainDetails: BlockchainDetail[] = useMemo(
    () => [
      {
        isLink: true,
        label: "Token Contract",
        value: <HashShortView hash={asset.address} />,
      },
      { label: "Token Standard", value: "RWA" },
      {
        label: "Token Supply",
        value: <Money>{tokenSupply}</Money>,
      },
      { label: "Holders", value: "-" },
      { label: "Asset Issuer", value: "Equiteez Issuance Ltd" },
      { label: "Issuer Address", value: "-" },
      { label: "Whitelist Registry", value: "-" },
      {
        label: "Distribution Contract",
        value: "-",
      },
      { label: "Price Oracle", value: "-" },
      { label: "Chain", value: "Mavryk Basenet" },
    ],
    [asset, tokenSupply]
  );

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
        <BlockchainDetailList asset={asset} />
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
