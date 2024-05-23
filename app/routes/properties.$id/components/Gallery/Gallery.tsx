import { FC } from 'react';

import MenuGridIcon from 'app/icons/menu-grid.svg?react';

import styles from './gallery.module.css';
import clsx from 'clsx';

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
            {idx === thumbs.length - 1 && <ShowAllPhotosBtn />}
          </div>
        ))}
      </div>
    </section>
  );
};

const ShowAllPhotosBtn: FC = () => {
  return (
    <button
      className={clsx(
        'bg-background text-content text-body-xs py-[10px] px-4',
        'flex items-center gap-x-2',
        'rounded-[5px] font-semibold',
        'absolute right-[13px] bottom-[15px] z-10'
      )}
    >
      <MenuGridIcon />
      Show all photos
    </button>
  );
};
