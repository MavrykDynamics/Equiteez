import clsx from "clsx";
import BannerMask from "app/assets/home/banner/banner-mask.webp";

import styles from "./bannerSection.module.css";

export const BannerSection = () => {
  return (
    <section className={clsx("pt-[116px] px-11")}>
      <div className="w-full flex  justify-center">
        <h1 className="text-hero text-black relative">
          Welcome to the future of ownership
          <img src={BannerMask} alt="equiteez" className={styles.bannerMask} />
        </h1>
      </div>
    </section>
  );
};
