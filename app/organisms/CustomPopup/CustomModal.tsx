import React, { FC } from 'react';

import Modal from 'react-modal';

import clsx from 'clsx';

import './custompopup.css';
export type CustomPopupContentPositionType = 'bottom' | 'center';

export type CustomPopupProps = Modal.Props &
  React.PropsWithChildren & {
    contentPosition?: CustomPopupContentPositionType;
  };

const CustomPopup: FC<CustomPopupProps> = (props) => {
  const {
    className,
    overlayClassName,
    contentPosition = 'bottom',
    portalClassName,
    ...restProps
  } = props;

  return (
    <Modal
      {...restProps}
      className={clsx(
        'bg-background rounded z-30 shadow-2xl p-8',
        className as string
      )}
      appElement={document.getElementById('root')!}
      closeTimeoutMS={200}
      overlayClassName={clsx(
        'fixed inset-0 z-30',
        'bg-content bg-opacity-60',
        contentPosition === 'bottom'
          ? 'flex items-end justify-center'
          : 'flex items-center justify-center',
        overlayClassName
      )}
      portalClassName={clsx('slideFromBottom', portalClassName)}
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
