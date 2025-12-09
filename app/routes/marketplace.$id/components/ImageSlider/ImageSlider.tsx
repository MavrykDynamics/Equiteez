import { useState, useRef, useEffect, FC } from "react";
import styles from "./ImageSlider.module.css";
import clsx from "clsx";

type ImageSliderPropsType = {
  images: string[];
  alt?: string;
  className?: string;
  onClick?: () => void;
};

export const ImageSlider: FC<ImageSliderPropsType> = ({
  images,
  alt = "Property image",
  className,
  onClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle scroll snap and update current index
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const scrollLeft = slider.scrollLeft;
      const itemWidth = slider.offsetWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    };

    slider.addEventListener("scroll", handleScroll);
    return () => {
      slider.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div
      className={clsx(styles.imageSlider, className)}
      onClick={onClick}
      role="button"
      aria-hidden
      tabIndex={0}
    >
      <div className={styles.sliderContainer}>
        <div ref={sliderRef} className={styles.sliderTrack}>
          {images.map((image, index) => (
            <div key={index} className={styles.slide}>
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className={styles.slideImage}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className={styles.slideCounter}>
          <span>
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
};
