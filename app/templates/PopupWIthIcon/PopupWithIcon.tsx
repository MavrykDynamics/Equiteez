import clsx from 'clsx';
import { FC, memo, PropsWithChildren, SyntheticEvent, useState } from 'react';

// organisms
import CustomPopup, {
  CustomPopupContentPositionType,
  CustomPopupProps,
} from '~/lib/organisms/CustomPopup/CustomPopup';

// icons
import CloseIcon from 'app/icons/cross.svg?react';

type PopupWithIconProps = {
  contentPosition?: CustomPopupContentPositionType;
} & CustomPopupProps;

const SCROLL_INDEX_POS = 24;

export const PopupWithIcon: FC<PopupWithIconProps> = ({
  children,
  className,
  contentPosition = 'center',
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
        'w-full relative  bg-background h-full overflow-y-auto',
        contentPosition === 'center' && 'max-w-[664px]',
        contentPosition !== 'center' && 'max-w-[617px]',
        className
      )}
    >
      <div
        className={clsx(
          animateCloseIcon
            ? 'sticky -top-8 h-14 right-0 w-full flex justify-end -mb-6'
            : 'absolute right-[24px] top-6',
          ' z-10',
          'transition duration-300 ease-in-out',
          animateCloseIcon && 'bg-white'
        )}
      >
        <button id="close-icon" className={clsx(animateCloseIcon && 'mt-6')}>
          <CloseIcon
            className="w-6 h-6 cursor-pointer relative text-content stroke-current"
            onClick={restProps.onRequestClose}
          />
        </button>
      </div>
      <div onScroll={scrollEvent}>{children}</div>
    </CustomPopup>
  );
};
