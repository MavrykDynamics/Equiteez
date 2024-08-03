import { FC } from 'react';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { DefaultPopupProps } from '../../popup.provider.types';

export type TransactionOperationPopupProps = {
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | null;
  title: string | React.ReactNode | null;
  body: string | React.ReactNode | null;
} & DefaultPopupProps;

export const TransactionOperationPopup: FC<TransactionOperationPopupProps> = ({
  Icon,
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
    >
      <div className="flex flex-col">
        <div>{Icon && <Icon />}</div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </PopupWithIcon>
  );
};
