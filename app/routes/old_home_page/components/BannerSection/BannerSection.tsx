import BannerMask from "app/assets/home/mask.svg";

import styles from "./bannerSection.module.css";
import { motion, MotionValue } from "framer-motion";
import { FC } from "react";

type BannerSectionProps = { opacity: MotionValue<number> };
export const BannerSection: FC<BannerSectionProps> = ({ opacity }) => {
  return (
    <motion.div whileInView={{ opacity: 1 }} style={{ opacity }}>
      <section className={styles.wrapper}>
        <img src={BannerMask} alt="equiteez" className={styles.bannerMask} />
        <h1 className={styles.heroTitle}>Welcome to the future of ownership</h1>
      </section>
    </motion.div>
  );
};
