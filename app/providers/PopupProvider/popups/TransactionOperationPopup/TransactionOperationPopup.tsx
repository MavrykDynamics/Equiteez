import { FC } from 'react';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { DefaultPopupProps } from '../../popup.provider.types';

export type TransactionOperationPopupProps = {
  icon: React.ReactNode | null;
  title: string | React.ReactNode | null;
  body: string | React.ReactNode | null;
} & DefaultPopupProps;

export const TransactionOperationPopup: FC<TransactionOperationPopupProps> = ({
  icon,
  title,
  body,
  isOpen,
  onRequestClose,
}) => {
  return (
    <PopupWithIcon
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentPosition={'center'}
      className={'w-[617px] h-[320px] px-11 py-16'}
    >
      <div className="flex flex-col">
        <div className="mx-auto inline-block">{icon}</div>

        <div className="inline-block mx-auto mt-6 mb-3 text-content text-section-headline">
          {title}
        </div>
        <p className="text-body text-content text-center">{body}</p>
      </div>
    </PopupWithIcon>
  );
};
