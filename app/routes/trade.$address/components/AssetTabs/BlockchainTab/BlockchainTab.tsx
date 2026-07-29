import type { ReactNode } from "react";

import CopyIcon from "~/icons/copy.svg?react";
import { CopyButton } from "~/lib/atoms/CopyButton";
import { RIcon } from "~/lib/atoms/RIcon/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

import styles from "./BlockchainTab.module.css";
import Money from "~/lib/atoms/Money";

const blockchainDetailsMock = {
  network: "Mavryk", // TODO remove mock data
  tokenStandard: "MRC-30 (Fungible)", // TODO remove mock data
  settlement: "Instant · Non-Custodial", // TODO remove mock data
  audit: "Verified", // TODO remove mock data
};

const formatTotalSupply = (totalSupply: string) => {
  const value = Number(totalSupply);

  return Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: 20 })
    : totalSupply;
};

const shortenAddress = (address: string) =>
  address.length > 14
    ? `${address.slice(0, 6)}...${address.slice(-5)}`
    : address;

type BlockchainDetailRowProps = {
  label: string;
  value: ReactNode;
};

function BlockchainDetailRow({ label, value }: BlockchainDetailRowProps) {
  return (
    <div className={styles.row}>
      <RText color="neutral-600" size="body-sm">
        {label}
      </RText>
      <div className={styles.value}>{value}</div>
    </div>
  );
}

export function BlockchainTab({ asset }: { asset: AssetType }) {
  const shortAddress = shortenAddress(asset.address);

  return (
    <section aria-label="Blockchain details" className={styles.details}>
      <BlockchainDetailRow
        label="Network"
        value={
          <RText size="body-sm" weight="medium">
            {blockchainDetailsMock.network}
          </RText>
        }
      />
      <BlockchainDetailRow
        label="Token Standard"
        value={
          <RText size="body-sm">{blockchainDetailsMock.tokenStandard}</RText>
        }
      />
      <BlockchainDetailRow
        label="Token Symbol"
        value={<RText size="body-sm">{asset.metadata.symbol}</RText>}
      />
      <BlockchainDetailRow
        label="Total Supply"
        value={
          <RText size="body-sm">
            <Money>{asset.total_supply}</Money> {asset.metadata.symbol}
          </RText>
        }
      />
      <BlockchainDetailRow
        label="Contract Address"
        value={
          <CopyButton
            className={styles.address}
            text={asset.address}
            type="block"
          >
            <RText size="body-sm">{shortAddress}</RText>
            <CopyIcon aria-hidden="true" className={styles.copyIcon} />
          </CopyButton>
        }
      />
      <BlockchainDetailRow
        label="Settlement"
        value={<RText size="body-sm">{blockchainDetailsMock.settlement}</RText>}
      />
      <BlockchainDetailRow
        label="Audit"
        value={
          <span className={styles.audit}>
            <RIcon className={styles.checkIcon} name="check" size="small" />
            <RText color="green-600" size="body-sm">
              {blockchainDetailsMock.audit}
            </RText>
          </span>
        }
      />
    </section>
  );
}
