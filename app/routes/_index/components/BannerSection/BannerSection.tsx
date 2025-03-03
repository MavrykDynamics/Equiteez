import clsx from "clsx";
import BannerMask from "app/assets/home/mask.svg";

import styles from "./bannerSection.module.css";
import { motion, MotionValue } from "framer-motion";
import { FC } from "react";

type BannerSectionProps = { opacity: MotionValue<number> };
export const BannerSection: FC<BannerSectionProps> = ({ opacity }) => {
  return (
    <motion.div whileInView={{ opacity: 1 }} style={{ opacity }}>
      <section className={clsx("pt-[142px]")}>
        <div className="w-full flex  justify-center">
          <h1 className="text-hero-medium text-black relative">
            Welcome to the future of ownership
            <img
              src={BannerMask}
              alt="equiteez"
              className={styles.bannerMask}
            />
          </h1>
        </div>
      </section>
    </motion.div>
  );
};
