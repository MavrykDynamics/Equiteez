import clsx from 'clsx';

// icons
import PlayIcon from 'app/icons/play-circle-rounded.svg?react';

import styles from './bannerSection.module.css';
import { Button } from '~/lib/atoms/Button';
import { Link } from '@remix-run/react';

// images
import Img1 from 'app/assets/home/banner/img-1.webp';
import Img2 from 'app/assets/home/banner/img-2.webp';
import Img3 from 'app/assets/home/banner/img-3.webp';
import Img4 from 'app/assets/home/banner/img-4.webp';
import Img5 from 'app/assets/home/banner/img-5.webp';
import Img6 from 'app/assets/home/banner/img-6.webp';
import { ButtonWithIcon } from '~/lib/atoms/Button/Button';

const assets = [Img1, Img2, Img3, Img4, Img5, Img6];

export const BannerSection = () => {
  return (
    <section className={clsx('pt-[100px] px-11', styles.bannerContainer)}>
      <div className="flex flex-col items-start self-center">
        <h1 className="text-hero text-content mb-4">
          Build your portfolio with every asset on the block
        </h1>
        <p className="text-content-secondary text-body mb-8">
          The future of asset ownership is digital. Start with just $50 to
          invest in fractionalized, fully compliant, income producing assets
          worldwide.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/properties">
            <Button>View Properties</Button>
          </Link>

          <ButtonWithIcon
            variant="outline"
            position="left"
            size="outline"
            disabled
            icon={<PlayIcon className="w-6 h-6 stroke-none fill-current" />}
          >
            How it works
          </ButtonWithIcon>
        </div>
      </div>
      <div className={styles.bannerImageWrapper}>
        {assets.map((imgSrc, idx) => (
          <div key={idx} className={styles[`img-${idx + 1}`]}>
            <div className="w-full h-full overflow-hidden rounded-lg">
              <img src={imgSrc} alt={`img-${idx + 1}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
