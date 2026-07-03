import DepositIcon from "app/icons/wallet/upload.svg?react";
import WithdrawalIcon from "app/icons/wallet/withdrawal.svg?react";

export enum TransactionTypes {
  ORDER = 0,
  TRANSFER = 1,
}

export enum TransferType {
  DEPOSIT = 0,
  WITHDRAW = 1,
}

export const TransferNameByType = {
  [TransferType.DEPOSIT]: "Deposit",
  [TransferType.WITHDRAW]: "Withdraw",
};

export const TransferSymbolByType = {
  [TransferType.DEPOSIT]: "+",
  [TransferType.WITHDRAW]: "-",
};

export const TransferIconByType = {
  [TransferType.DEPOSIT]: <DepositIcon />,
  [TransferType.WITHDRAW]: <WithdrawalIcon />,
};
