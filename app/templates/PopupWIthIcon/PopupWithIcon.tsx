import clsx from 'clsx';
import { FC, memo, PropsWithChildren } from 'react';

// organisms
import CustomPopup, {
  CustomPopupContentPositionType,
  CustomPopupProps,
} from '~/organisms/CustomPopup/CustomPopup';

// icons
import CloseIcon from 'app/icons/cross.svg?react';

type PopupWithIconProps = {
  contentPosition?: CustomPopupContentPositionType;
} & CustomPopupProps;

export const PopupWithIcon: FC<PopupWithIconProps> = ({
  children,
  className,
  contentPosition = 'center',
  ...restProps
}) => {
  return (
    <CustomPopup
      {...restProps}
      contentPosition={contentPosition}
      shouldCloseOnEsc
      className={clsx(
        'w-full relative  bg-background',
        contentPosition === 'center' && 'max-w-[664px]',
        contentPosition !== 'center' && 'max-w-[617px]',
        className
      )}
    >
      <div
        className={clsx(
          'absolute left-0 top-8 px-8 w-full flex justify-end items-center',
          'transition duration-300 ease-in-out z-10'
        )}
      >
        <button id="close-icon">
          <CloseIcon
            className="w-6 h-6 cursor-pointer"
            onClick={restProps.onRequestClose}
          />
        </button>
      </div>
      <ChildComponent>{children}</ChildComponent>
    </CustomPopup>
  );
};

// eslint-disable-next-line react/display-name
const ChildComponent = memo(({ children }: PropsWithChildren) => {
  return <div className="h-full">{children}</div>;
});
