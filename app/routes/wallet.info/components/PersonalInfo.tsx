import React from "react";
import styles from "../styles.module.css";
import classNames from "clsx";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import { RoundedCard } from "~/lib/atoms/RoundedCard/RoundedCard";

export function PersonalInfo() {
  return (
    <RoundedCard
      className={classNames(styles.roundedWrapper, styles.userInfoWrapper)}
    >
      <Heading level="5">Personal Information</Heading>
      <div className={styles.personalInfoContainer}>
        <div className={styles.personalInfoItem}>
          <Text weight="bold">First Name</Text>
          <div className={styles.personalInfoItemContent}>
            <Text
              size="smallBody"
              weight="bold"
              className={styles.personalInfoItemText}
            >
              Layla
            </Text>
          </div>
        </div>

        <div className={styles.personalInfoItem}>
          <Text weight="bold">Last Name</Text>
          <div className={styles.personalInfoItemContent}>
            <Text
              size="smallBody"
              weight="bold"
              className={styles.personalInfoItemText}
            >
              Al Hamadi
            </Text>
          </div>
        </div>

        <div className={styles.personalInfoItem}>
          <Text weight="bold">Email Address</Text>
          <div className={styles.personalInfoItemContent}>
            <Text
              size="smallBody"
              weight="bold"
              className={styles.personalInfoItemText}
            >
              layla.alhamadi96@gmail.com
            </Text>
          </div>
        </div>

        <div className={styles.personalInfoItem}>
          <Text weight="bold">Phone Number</Text>
          <div className={styles.personalInfoItemContent}>
            <Text
              size="smallBody"
              weight="bold"
              className={styles.personalInfoItemText}
            >
              +971 50 748 2631
            </Text>
          </div>
        </div>

        <div className={styles.personalInfoItem}>
          <Text weight="bold">Country</Text>
          <div className={styles.personalInfoItemContent}>
            <Text
              size="smallBody"
              weight="bold"
              className={styles.personalInfoItemText}
            >
              United Arab Emirates
            </Text>
          </div>
        </div>

        <div className={styles.personalInfoItem}>
          <Text weight="bold">Date of Birth</Text>
          <div className={styles.dateInfo}>
            <div className={styles.personalInfoItemContent}>
              <Text
                size="smallBody"
                weight="bold"
                className={styles.personalInfoItemText}
              >
                14
              </Text>
            </div>
            <div className={styles.personalInfoItemContent}>
              <Text
                size="smallBody"
                weight="bold"
                className={styles.personalInfoItemText}
              >
                08
              </Text>
            </div>
            <div className={styles.personalInfoItemContent}>
              <Text
                size="smallBody"
                weight="bold"
                className={styles.personalInfoItemText}
              >
                1996
              </Text>
            </div>
          </div>
        </div>
      </div>
    </RoundedCard>
  );
}
