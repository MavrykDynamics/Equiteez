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
        isOpen={isOpen}
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
        contentLabel={`${name}, view ${(selectedIndex ?? 0) + 1}`}
        contentPosition="center"
        isOpen={isOpen && selectedIndex !== null}
        onRequestClose={() => setSelectedIndex(null)}
        overlayClassName={styles.overlay}
      >
        {renderHeader(() => setSelectedIndex(null), "Back to full gallery")}
        {selectedIndex !== null ? (
          <div className={styles.singleImageContent}>
            {images.length > 1 ? (
              <button
                aria-label="Previous image"
                className={`${sliderStyles.arrowButton} ${sliderStyles.previousButton}`}
                disabled={selectedIndex === 0}
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
              alt={`${name}, view ${selectedIndex + 1}`}
              className={styles.fullSizeImage}
              src={images[selectedIndex]}
            />
            {images.length > 1 ? (
              <button
                aria-label="Next image"
                className={`${sliderStyles.arrowButton} ${sliderStyles.nextButton}`}
                disabled={selectedIndex === images.length - 1}
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
        ) : null}
      </CustomPopup>
    </>
  );
}
