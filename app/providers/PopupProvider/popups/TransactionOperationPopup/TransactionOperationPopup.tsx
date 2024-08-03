import { FC } from 'react';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';

export type TransactionOperationPopupProps = {
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

  title: string | React.ReactNode;
  body: string | React.ReactNode;
  isOpen: boolean;
};

export const TransactionOperationPopup: FC<TransactionOperationPopupProps> = ({
  Icon,
  title,
  body,
  isOpen,
}) => {
  return (
    <PopupWithIcon
      isOpen={isOpen}
      // onRequestClose={handleRequestClose}
      contentPosition={'center'}
    >
      <div className="flex flex-col">
        <div>
          <Icon />
        </div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </PopupWithIcon>
  );
};
