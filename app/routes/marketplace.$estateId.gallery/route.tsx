import type { MetaFunction } from "@remix-run/node";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import clsx from "clsx";

// icons
import ArrowLeftIcon from "app/icons/arrow-left.svg?react";
import LikeIcon from "app/icons/like.svg?react";
import ShareIcon from "app/icons/share.svg?react";

// styles
import styles from "./route.module.css";

// components
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import { useMarketByParamIdentifier } from "../marketplace.$id/hooks/use-market-by-identifier";
import { Link } from "@remix-run/react";
import { FullScreenSpinner } from "~/lib/atoms/Spinner/Spinner";
import DocBg from "~/a11y/DocBg";
const GallerySlider = lazy(() => import("./components/GallerySlider"));

export const meta: MetaFunction = () => {
  return [
    { title: "Gallery" },
    { name: "description", content: "Estate gallery" },
  ];
};

export default function Index() {
  const estateData = useMarketByParamIdentifier("estateId");
  const [isOpen, setIsOpen] = useState(false);
  const [pickedImgIdx, setPickedImgIdx] = useState(0);

  const handleOpen = useCallback((idx: number) => {
    setPickedImgIdx(idx);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const images = useMemo(
    () =>
      estateData
        ? [
            estateData.assetDetails.previewImage,
            ...estateData.assetDetails.assetImages,
          ]
        : [],
    [estateData]
  );

  if (!estateData) return <FullScreenSpinner />;

  return (
    <section className={clsx("min-h-screen")}>
      <DocBg bgClassName={"bg-background"} />
      <div className="mx-auto max-w-[1440px]">
        <header className="flex items-center justify-between px-11 pt-8">
          <Link
            to={`/marketplace/${estateData.assetDetails.blockchain[0].identifier}`}
          >
            <button>
              <ArrowLeftIcon className="w-6 h-6 text-content stroke-current" />
            </button>
          </Link>
          <section className="flex items-center gap-x-4 ml-auto">
            <button className="text-content text-body flex items-center gap-x-1 font-semibold">
              <LikeIcon className="stroke-current" />
              <p>Save</p>
            </button>
            <button className="text-content text-body flex items-center gap-x-1 font-semibold">
              <ShareIcon className="stroke-current" />
              <p>Share</p>
            </button>
          </section>
        </header>
        <div className="max-w-[894px] mx-auto mt-16 mb-[120px]">
          <div className={clsx(styles.gallery, "cursor-pointer")}>
            {images.map((img, idx) => (
              <div
                role="presentation"
                key={idx}
                onClick={() => handleOpen(idx)}
                className={clsx(
                  styles.galleryItem,
                  "bg-dark-green-opacity overflow-hidden"
                )}
              >
                <img src={img} alt="gallery item" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CustomPopup
        isOpen={isOpen}
        contentPosition={"center"}
        shouldCloseOnEsc
        shouldFocusAfterRender={false}
        className={clsx(
          "w-full h-full relative bg-black-secondary rounded-none px-11 py-8"
        )}
      >
        <Suspense fallback={<FullScreenSpinner />}>
          <GallerySlider
            handleClose={handleClose}
            images={images}
            pickedImgIdx={pickedImgIdx}
          />
        </Suspense>
      </CustomPopup>
    </section>
  );
}
