import styles from "./WhyInvest.module.css";
import classNames from "clsx";

export function WhyInvest() {
  return (
    <div className={styles.section}>
      <h3 className={`text-content text-card-headline ${styles.sectionTitle}`}>Why Invest? </h3>
      <div className={styles.reasonsGrid}>
        <div className={styles.reasonRow}>
          <div className={styles.reasonCard}>
            <span className={classNames(styles.cardTitle, "font-semibold text-dark-green-500")}>Prime Location</span>
            <span className={styles.cardText}>
              Dubai Creekside is an essential part of Dubai&apos;s identity. Set
              along peaceful creek waters, it offers a blend of heritage,
              culture, and modernity.
            </span>
          </div>

          <div className={styles.reasonCard}>
            <span className={classNames(styles.cardTitle, "font-semibold text-dark-green-500")}>High Rental Demand</span>
            <span className={styles.cardText}>
              Strong investment fundamentals with an 8.88% projected rental
              yield, driven by consistent demand from high-net-worth travelers
              and business visitors.
            </span>
          </div>
        </div>

        <div className={styles.reasonRow}>
          <div className={styles.reasonCard}>
            <span className={classNames(styles.cardTitle, "font-semibold text-dark-green-500")}>Luxury Living</span>
            <span className={styles.cardText}>
              Each suite offers an intimate sanctuary of luxury, bespoke
              furnishings, and private balconies that open to breathtaking views
              of the Arabian Gulf.
            </span>
          </div>

          <div className={styles.reasonCard}>
            <span className={classNames(styles.cardTitle, "font-semibold text-dark-green-500")}>
              Dubai&apos;s Growth Trajectory
            </span>
            <span className={styles.cardText}>
              Capitalize on Dubai&apos;s exceptional growth trajectory, fueled
              by the emirate&apos;s continued investment in tourism
              infrastructure, Expo legacy projects, and positioning as a global
              financial center.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
