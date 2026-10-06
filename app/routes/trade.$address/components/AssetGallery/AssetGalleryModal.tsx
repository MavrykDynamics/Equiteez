import { useEffect, useState } from "react";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import styles from "./AssetGalleryModal.module.css";
import sliderStyles from "./AssetGallerySlider.module.css";

type AssetGalleryModalProps = {
  images: string[];
  isOpen: boolean;
  name: string;
  onClose: () => void;
};

export function AssetGalleryModal({
  images,
  isOpen,
  name,
  onClose,
}: AssetGalleryModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isSingleImage = images.length === 1;
  const fullSizeIndex = isSingleImage ? 0 : selectedIndex;
  const handleFullSizeClose = () => {
    if (isSingleImage) onClose();
    else setSelectedIndex(null);
  };

  useEffect(() => {
    if (!isOpen) setSelectedIndex(null);
  }, [isOpen]);

  const renderHeader = (handleClose: () => void, closeLabel: string) => (
    <header className={styles.header}>
      <button
        aria-label={closeLabel}
        className={styles.closeButton}
        onClick={handleClose}
        type="button"
      >
        <RIcon aria-hidden="true" name="arrow-long-left" size="medium" />
      </button>
      <RText className={styles.title} size="body-l" weight="medium">
        {name}
      </RText>
      <span aria-hidden="true" className={styles.headerSpacer} />
    </header>
  );

  return (
    <>
      <CustomPopup
        className={styles.modal}
        contentLabel={`${name} gallery`}
        contentPosition="center"
        isOpen={isOpen && !isSingleImage}
        onRequestClose={onClose}
        overlayClassName={styles.overlay}
      >
        {renderHeader(onClose, "Close gallery")}

        <div className={styles.gallery}>
          {images.map((image, index) => (
            <button
              aria-label={`Open ${name}, view ${index + 1} full size`}
              className={styles.imageButton}
              key={`${image}:${index}`}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <img
                alt={`${name}, view ${index + 1}`}
                className={styles.image}
                loading={index < 3 ? "eager" : "lazy"}
                src={image}
              />
            </button>
          ))}
        </div>
      </CustomPopup>
      <CustomPopup
        className={`${styles.modal} ${styles.singleImageModal}`}
        contentLabel={`${name}, view ${(fullSizeIndex ?? 0) + 1}`}
        contentPosition="center"
        isOpen={isOpen && fullSizeIndex !== null}
        onRequestClose={handleFullSizeClose}
        overlayClassName={styles.overlay}
      >
        <header className={styles.singleImageHeader}>
          <button
            aria-label={
              isSingleImage ? "Close gallery" : "Back to full gallery"
            }
            className={styles.closeButton}
            onClick={handleFullSizeClose}
            type="button"
          >
            <RIcon aria-hidden="true" name="close" size="medium" />
          </button>
        </header>
        {fullSizeIndex !== null ? (
          <div className={styles.singleImageContent}>
            {!isSingleImage ? (
              <RText color="neutral-white" size="body-sm">
                {fullSizeIndex + 1} / {images.length}
              </RText>
            ) : null}
            <div className={styles.singleImageRow}>
              {images.length > 1 ? (
                <button
                  aria-label="Previous image"
                  className={`${sliderStyles.arrowButton} ${sliderStyles.previousButton} ${styles.fullSizeArrow}`}
                  disabled={fullSizeIndex === 0}
                  onClick={() =>
                    setSelectedIndex((index) =>
                      index === null ? null : Math.max(0, index - 1)
                    )
                  }
                  type="button"
                >
                  <RIcon
                    aria-hidden="true"
                    name="arrow-short-left"
                    size="medium"
                  />
                </button>
              ) : null}
              <img
                alt={`${name}, view ${fullSizeIndex + 1}`}
                className={styles.fullSizeImage}
                src={images[fullSizeIndex]}
              />
              {images.length > 1 ? (
                <button
                  aria-label="Next image"
                  className={`${sliderStyles.arrowButton} ${sliderStyles.nextButton} ${styles.fullSizeArrow}`}
                  disabled={fullSizeIndex === images.length - 1}
                  onClick={() =>
                    setSelectedIndex((index) =>
                      index === null
                        ? null
                        : Math.min(images.length - 1, index + 1)
                    )
                  }
                  type="button"
                >
                  <RIcon
                    aria-hidden="true"
                    name="arrow-short-right"
                    size="medium"
                  />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </CustomPopup>
    </>
  );
}
