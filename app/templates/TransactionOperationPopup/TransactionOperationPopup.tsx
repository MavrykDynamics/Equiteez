import { Divider } from '~/lib/atoms/Divider';
import { PopupWithIcon } from '../PopupWIthIcon/PopupWithIcon';
import { FC } from 'react';

type TransactionOperationPopupProps = {
  icon:
    | React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    | React.ReactNode;
  title: string | React.ReactNode;
  body: string | React.ReactNode;
};

export const TransactionOperationPopup: FC<TransactionOperationPopupProps> = ({
  icon,
  title,
  body,
}) => {
  return (
    <PopupWithIcon
      isOpen={true}
      // onRequestClose={handleRequestClose}
      contentPosition={'center'}
    >
      <div className="flex flex-col"></div>
    </PopupWithIcon>
  );
};
