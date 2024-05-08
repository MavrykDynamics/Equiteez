import { FC, useMemo } from 'react';

import styles from './gallery.module.css';
import { ImageStacked } from '~/molecules/ImageStacked';

type GalleryProps = {
  mainImgsrc: string;
  thumbs: string[];
};

export const Gallery: FC<GalleryProps> = ({ mainImgsrc, thumbs }) => {
  return (
    <section className="px-11 mb-16">
      <div className={styles.gallery}>
        <div className={styles.bannerImg}>
          <img src={mainImgsrc} alt={'banner img'} className="w-full h-full" />
        </div>
        {thumbs.map((thumb, idx) => (
          <div key={idx} className={styles.thumb}>
            <img src={thumb} alt="thumb" className="w-full h-full" />
          </div>
        ))}
      </div>
    </section>
  );
};
