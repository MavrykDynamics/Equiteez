import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import styles from "./AssetGalleryModal.module.css";

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
  return (
    <CustomPopup
      className={styles.modal}
      contentLabel={`${name} gallery`}
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      <header className={styles.header}>
        <button
          aria-label="Close gallery"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon aria-hidden="true" name="arrow-long-left" size="medium" />
        </button>
        <RText className={styles.title} size="body-l" weight="medium">
          {name}
        </RText>
        <span aria-hidden="true" className={styles.headerSpacer} />
      </header>

      <div className={styles.gallery}>
        {images.map((image, index) => (
          <img
            alt={`${name}, view ${index + 1}`}
            className={styles.image}
            key={image}
            loading={index < 3 ? "eager" : "lazy"}
            src={image}
          />
        ))}
      </div>
    </CustomPopup>
  );
}
