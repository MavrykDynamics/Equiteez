import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";

import styles from "./WhyInvest.module.css";

export function WhyInvest() {
  return (
    <div className={styles.section}>
      <Heading level="5" className={styles.sectionTitle}>
        Why Invest?{" "}
      </Heading>
      <div className={styles.reasonsGrid}>
        <div className={styles.reasonRow}>
          <div className={styles.reasonCard}>
            <Text
              weight="bold"
              color="darkGreen"
              className={styles.cardTitle}
            >
              Prime Location
            </Text>
            <Text className={styles.cardText}>
              Dubai Creekside is an essential part of Dubai&apos;s identity. Set
              along peaceful creek waters, it offers a blend of heritage,
              culture, and modernity.
            </Text>
          </div>

          <div className={styles.reasonCard}>
            <Text
              weight="bold"
              color="darkGreen"
              className={styles.cardTitle}
            >
              High Rental Demand
            </Text>
            <Text className={styles.cardText}>
              Strong investment fundamentals with an 8.88% projected rental
              yield, driven by consistent demand from high-net-worth travelers
              and business visitors.
            </Text>
          </div>
        </div>

        <div className={styles.reasonRow}>
          <div className={styles.reasonCard}>
            <Text
              weight="bold"
              color="darkGreen"
              className={styles.cardTitle}
            >
              Luxury Living
            </Text>
            <Text className={styles.cardText}>
              Each suite offers an intimate sanctuary of luxury, bespoke
              furnishings, and private balconies that open to breathtaking views
              of the Arabian Gulf.
            </Text>
          </div>

          <div className={styles.reasonCard}>
            <Text
              weight="bold"
              color="darkGreen"
              className={styles.cardTitle}
            >
              Dubai&apos;s Growth Trajectory
            </Text>
            <Text className={styles.cardText}>
              Capitalize on Dubai&apos;s exceptional growth trajectory, fueled
              by the emirate&apos;s continued investment in tourism
              infrastructure, Expo legacy projects, and positioning as a global
              financial center.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
