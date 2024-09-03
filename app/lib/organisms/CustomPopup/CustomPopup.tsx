import React, { FC } from 'react';

import Modal from 'react-modal';

import clsx from 'clsx';

import { useAppContext } from '~/providers/AppProvider/AppProvider';

import './animations.css';
import { onAfterClose, onAfterOpen } from './utils';
import { twMerge } from '~/lib/utils/tw-merge';

const popupAnimation = {
  left: 'slidePopupLeft',
  right: 'slidePopupRight',
  center: 'zoomPopup',
};

export const DEFAULT_POPUP_ANIMATION_DELAY = 200;

export type CustomPopupContentPositionType = 'left' | 'center' | 'right';

export type CustomPopupProps = Modal.Props &
  React.PropsWithChildren & {
    contentPosition?: CustomPopupContentPositionType;
  };

const CustomPopup: FC<CustomPopupProps> = (props) => {
  const {
    className,
    overlayClassName,
    contentPosition = 'center',
    portalClassName,
    ...restProps
  } = props;

  const { IS_WEB } = useAppContext();

  return (
    <Modal
      {...restProps}
      className={twMerge(
        className,
        'bg-white z-30 shadow-2xl p-8',
        contentPosition === 'center' && 'rounded-3xl'
      )}
      appElement={IS_WEB ? document.getElementById('root')! : undefined}
      closeTimeoutMS={DEFAULT_POPUP_ANIMATION_DELAY}
      overlayClassName={clsx(
        'fixed inset-0 z-30',
        'bg-black bg-opacity-60',
        contentPosition === 'center' && 'flex items-center justify-center',
        contentPosition === 'left' && 'flex items-stretch justify-start',
        contentPosition === 'right' && 'flex items-stretch justify-end',
        overlayClassName
      )}
      portalClassName={clsx(portalClassName, popupAnimation[contentPosition])}
      preventScroll
      onAfterOpen={() => {
        onAfterOpen();
      }}
      onAfterClose={() => {
        onAfterClose();
      }}
    />
  );
};

export default CustomPopup;
