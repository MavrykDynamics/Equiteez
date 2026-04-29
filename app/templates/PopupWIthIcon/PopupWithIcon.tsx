import clsx from "clsx";
import { FC, SyntheticEvent, useState } from "react";

// organisms
import CustomPopup, {
  CustomPopupContentPositionType,
  CustomPopupProps,
} from "~/lib/organisms/CustomPopup/CustomPopup";

// icons
import CloseIcon from "app/icons/cross.svg?react";

type PopupWithIconProps = {
  contentClassName?: string;
  contentPosition?: CustomPopupContentPositionType;
} & CustomPopupProps;

const SCROLL_INDEX_POS = 24;

export const PopupWithIcon: FC<PopupWithIconProps> = ({
  children,
  className,
  contentClassName,
  contentPosition = "center",
  ...restProps
}) => {
  const [animateCloseIcon, setAnimateCloseIcon] = useState(false);

  const scrollEvent = (e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;

    if (target.scrollTop > SCROLL_INDEX_POS && !animateCloseIcon) {
      setAnimateCloseIcon(true);
    }

    if (target.scrollTop < SCROLL_INDEX_POS && animateCloseIcon) {
      setAnimateCloseIcon(false);
    }
  };
  return (
    <CustomPopup
      {...restProps}
      contentPosition={contentPosition}
      shouldCloseOnEsc
      className={clsx(
        "w-full relative  bg-background h-full p-0",
        contentPosition === "center" && "max-w-[664px]",
        contentPosition !== "center" && "max-w-[617px]",
        className
      )}
    >
      <div
        onScroll={scrollEvent}
        className={clsx(
          "box-border w-full h-full min-h-0 overflow-y-auto px-[16px] py-[32px] md:p-8 transition duration-300 ease-in-out flex flex-col focus:outline-none",
          contentClassName
        )}
      >
        <div
          className={clsx(
            "transition duration-300 ease-in-out fixed right-[16px] md:right-[48px]",
            "top-8 flex justify-end",
            animateCloseIcon ? "w-full" : "w-fit",
            "z-20"
          )}
        >
          <button id="close-icon">
            <CloseIcon
              className="w-6 h-6 cursor-pointer relative text-content stroke-current"
              onClick={restProps.onRequestClose}
            />
          </button>
        </div>
        {children}
      </div>
    </CustomPopup>
  );
};
