import React, { FC } from 'react';

import Modal from 'react-modal';

import clsx from 'clsx';

import styles from './custompopup.module.css';
import { useAppContext } from '~/providers/AppProvider/AppProvider';
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
      className={clsx(
        'bg-background z-30 shadow-2xl p-8',
        contentPosition === 'center' && 'rounded-3xl',
        className
      )}
      appElement={IS_WEB ? document.getElementById('root')! : undefined}
      closeTimeoutMS={200}
      overlayClassName={clsx(
        'fixed inset-0 z-30',
        'bg-black bg-opacity-60',
        contentPosition === 'center' && 'flex items-center justify-center',
        contentPosition === 'left' && 'flex items-stretch justify-start',
        contentPosition === 'right' && 'flex items-stretch justify-end',
        overlayClassName
      )}
      portalClassName={clsx(styles.slideFromBottom, portalClassName)}
      preventScroll
      onAfterOpen={() => {
        document.body.classList.add('overscroll-y-none');
      }}
      onAfterClose={() => {
        document.body.classList.remove('overscroll-y-none');
      }}
    />
  );
};

export default CustomPopup;
