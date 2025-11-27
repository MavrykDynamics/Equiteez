import styles from "~/routes/wallet.info/styles.module.css";
import ProfileGradientBg from "~/assets/wallet/profileGradientBg.png";
import { Icon } from "~/lib/atoms/Icon";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
import { RoundedCard } from "~/lib/atoms/RoundedCard/RoundedCard";
import React from "react";

export function AccountBlock() {
  return (
    <RoundedCard className={styles.roundedWrapper}>
      <div className="flex flex-col gap-[24px] items-center w-full">
        <img
          src={ProfileGradientBg}
          alt="gradient"
          className={styles.profileGradient}
        />
        <div className={styles.accountIcon}>
          <div className={styles.accountIconContent}>
            <Icon icon="userIcon" />
          </div>
        </div>
        <div className="flex flex-col gap-[12px] items-center">
          <Heading level="5">Layla Al Hamadi</Heading>
          <div className="flex flex-col gap-[8px] items-center">
            <Text size="smallBody" weight="bold" color="lightBlue">
              +971 50 748 2631
            </Text>
            <Text size="smallBody" weight="bold" color="lightBlue">
              layla.alhamadi96@gmail.com
            </Text>
          </div>
        </div>
        <ButtonV2 variant="yellowOutlined" className={styles.editBtn}>
          Edit Profile on MultibankIO
        </ButtonV2>
      </div>
    </RoundedCard>
  );
}
