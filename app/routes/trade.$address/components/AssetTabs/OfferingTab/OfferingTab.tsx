import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./OfferingTab.module.css";
import infoIcon from "./ROfferingInfoIcon.svg";
import { AssetType } from "~/lib/apis/rwa/assets/assets.types";

type OfferingDetail = {
  label: string;
  value: string;
};

const offeringDetails: OfferingDetail[] = [
  { label: "Offering Date", value: "12 Mar 2025" },
  { label: "Issuer", value: "Equiteez Issuance Ltd" },
  { label: "Minimum Investment", value: "$100.00" },
  { label: "Maximum investment", value: "$2,483,835" },
  { label: "Amount Raised", value: "$20,796,954" },
  { label: "Offered Supply", value: "86% of tokens" },
];

const complianceDetails: OfferingDetail[] = [
  { label: "Token Standard", value: "MRC-30" },
  { label: "Transfer Restrictions", value: "Whitelist Enforced On-chain" },
  { label: "Investor Eligibility", value: "KYC and AML passed" },
  { label: "SPV Jurisdiction", value: "BVI SPV, Reg D and Reg S" },
  { label: "Custody", value: "Non Custodial, Self Held" },
  { label: "Reporting", value: "Quarterly, On-Chain Attested" },
];

function DetailList({ details }: { details: OfferingDetail[] }) {
  return (
    <dl className={styles.detailList}>
      {details.map(({ label, value }) => (
        <div className={styles.detail} key={label}>
          <dt>
            <RText color="neutral-700" size="body-sm">
              {label}
            </RText>
          </dt>
          <dd>
            <RText color="neutral-black" size="body-sm">
              {value}
            </RText>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function OfferingTab(asset: AssetType) {
  return (
    <div className={styles.wrapper}>
      <section className={styles.section} aria-labelledby="offering-heading">
        <RHeading id="offering-heading" size="h7" weight="medium">
          Offering
        </RHeading>
        <DetailList details={offeringDetails} />
        <div className={styles.detail}>
          <RText color="neutral-700" size="body-sm">
            Status
          </RText>
          <RText className={styles.status} size="body-s">
            TRADING ON SECONDARY
          </RText>
        </div>
      </section>

      <div aria-hidden="true" className={styles.divider} />

      <section className={styles.section} aria-labelledby="compliance-heading">
        <RHeading id="compliance-heading" size="h7" weight="medium">
          Compliance
        </RHeading>
        <DetailList details={complianceDetails} />
        <aside className={styles.notice}>
          <img
            aria-hidden="true"
            alt="notice"
            className={styles.noticeIcon}
            src={infoIcon}
          />
          <RText color="neutral-black" size="body-sm">
            Equiteez does not execute trades or hold client assets. The order
            book is a non-custodial contract on Mavryk and settlement is
            peer-to-peer.
          </RText>
        </aside>
      </section>
    </div>
  );
}
