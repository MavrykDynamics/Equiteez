import { FC, useMemo } from "react";

import MenuGridIcon from "app/icons/menu-grid.svg?react";
import ImagePlaceholder from "app/icons/image.svg?react";

import styles from "./gallery.module.css";
import clsx from "clsx";
import { Link } from "@remix-run/react";

const IMAGES_PREVIEW_MAX = 5;

type GalleryProps = {
  mainImgsrc: string;
  thumbs: string[];
  propertyId: string;
};

const galleryClassName: StringRecord<string> = {
  0: styles.galleryZeroImages,
  1: styles.galleryOnly1,
  2: styles.galleryOnly2,
  3: styles.galleryOnly3,
  4: styles.galleryOnly4,
  gte5: styles.galleryGTE5,
};

export const Gallery: FC<GalleryProps> = ({
  mainImgsrc,
  thumbs,
  propertyId,
}) => {
  const hasMainImage = Boolean(mainImgsrc);
  const imagesCount = useMemo(
    () => thumbs.length + (hasMainImage ? 1 : 0),
    [thumbs, hasMainImage]
  );

  console.log(imagesCount);

  return (
    <section className="px-11 mb-16">
      <div
        className={clsx(
          styles.gallery,
          galleryClassName[
            imagesCount < IMAGES_PREVIEW_MAX ? imagesCount : "gte5"
          ]
        )}
      >
        <div className={styles.bannerImg}>
          {hasMainImage ? (
            <img
              src={mainImgsrc}
              alt={"banner img"}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImagePlaceholder />
            </div>
          )}
        </div>
        {thumbs.map((thumb, idx) => (
          <div key={idx} className={styles.thumb}>
            <img src={thumb} alt="thumb" className="w-full h-full" />
            {idx === thumbs.length - 1 && imagesCount >= IMAGES_PREVIEW_MAX && (
              <ShowAllPhotosBtn propertyId={propertyId} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const ShowAllPhotosBtn: FC<{ propertyId: string }> = ({ propertyId }) => {
  return (
    <Link to={`/properties/${propertyId}/gallery`}>
      <button
        className={clsx(
          "bg-background text-content text-body-xs py-[10px] px-4",
          "flex items-center gap-x-2",
          "rounded-[5px] font-semibold",
          "absolute right-[13px] bottom-[15px] z-10"
        )}
      >
        <MenuGridIcon />
        Show all photos
      </button>
    </Link>
  );
};
