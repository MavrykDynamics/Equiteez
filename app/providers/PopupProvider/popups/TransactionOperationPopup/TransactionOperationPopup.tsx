import { FC } from 'react';
import { DefaultPopupProps } from '../../popup.provider.types';
import CustomPopup from '~/lib/organisms/CustomPopup/CustomPopup';
import CloseIcon from 'app/icons/cross.svg?react';

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
    <CustomPopup
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentPosition={'center'}
      overlayClassName="z-[9999]"
      className={'w-[617px]  h-[292px] max-h-screen px-11 py-16 z-100 relative'}
    >
      <button className="absolute top-8 right-8 z-10">
        <CloseIcon
          className="w-6 h-6 cursor-pointer relative text-content stroke-current"
          onClick={onRequestClose}
        />
      </button>
      <div className="flex flex-col">
        <div className="mx-auto inline-block">{icon}</div>

        <div className="inline-block mx-auto mt-6 mb-3 text-content text-section-headline">
          {title}
        </div>
        <p className="text-body text-content text-center">{body}</p>
      </div>
    </CustomPopup>
  );
};
