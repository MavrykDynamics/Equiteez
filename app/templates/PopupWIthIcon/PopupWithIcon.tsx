import clsx from 'clsx';
import { FC, memo, PropsWithChildren } from 'react';

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
          'absolute right-0 top-8 px-8 w-full flex justify-end items-center max-w-16',
          'transition duration-300 ease-in-out'
        )}
      >
        <button id="close-icon">
          <CloseIcon
            className="w-6 h-6 cursor-pointer relative text-content stroke-current"
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
  return <div className="h-full overflow-y-auto">{children}</div>;
});
