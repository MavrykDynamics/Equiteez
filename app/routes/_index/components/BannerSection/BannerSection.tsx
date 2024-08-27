import clsx from 'clsx';

// icons
import PlayIcon from 'app/icons/play-circle-rounded.svg?react';

import BannerImageSrc from 'app/assets/home/banner-image.png';
import styles from './bannerSection.module.css';
import { Button } from '~/lib/atoms/Button';
import { Link } from '@remix-run/react';

export const BannerSection = () => {
  return (
    <section className={clsx('pt-8 px-11', styles.bannerContainer)}>
      <div className="flex flex-col items-start self-center">
        <h1 className="text-hero text-content mb-4">
          Build your portfolio with every asset on the block
        </h1>
        <p className="text-content-secondary text-body mb-8">
          The future of real estate ownership is digital. Start with just $50 to
          invest in fractionalized, fully compliant, income producing assets
          worldwide.
        </p>
        <div className="flex items-center gap-x-6">
          <Link to="/properties">
            <Button>View Properties</Button>
          </Link>
          <Button variant="outline">
            <div className="flex items-center gap-2">
              <PlayIcon className="w-[30px] h-[30px] stroke-none fill-current" />
              How it works
            </div>
          </Button>
        </div>
      </div>
      <div className={styles.bannerImageWrapper}>
        <img src={BannerImageSrc} alt="house" />
      </div>
    </section>
  );
};
