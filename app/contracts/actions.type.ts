import { TransactionWalletOperation } from "@mavrykdynamics/taquito";
import { BatchWalletOperation } from "@mavrykdynamics/taquito/dist/types/wallet/batch-operation";
import { WalletOperationError } from "~/errors/error";
import { WalletErrorPayload } from "~/errors/error.type";
import { STAKE_ACTION, UNSTAKE_ACTION } from "./consts";

export type ActionErrorReturnType = {
  actionSuccess: boolean;
  error: WalletErrorPayload | WalletOperationError;
};
export type ActionSuccessReturnType = {
  actionSuccess: boolean;
  operation: TransactionWalletOperation | BatchWalletOperation;
};

export type ContractActionConfirmation = {
  level: number;
  opHash?: string;
};

export type ContractActionSubmission = {
  opHash: string;
};

/** How the current wallet executes direct (MVRK-paid) operations. */
export type DirectExecutionOptions = {
  /**
   * Estimate fees/burn and check the MVRK balance before sending. Needed for
   * embedded wallets, which show no fee review of their own.
   */
  checkNativeBudget?: boolean;
};

export type ContractActionSuccessMetadata = {
  confirmation: ContractActionConfirmation | null;
};

export type ContractActionLifecycleCallbacks = {
  onTransactionConfirmed?: (confirmation: ContractActionConfirmation) => void;
  onTransactionSubmitted?: (submission?: ContractActionSubmission) => void;
  execution?: DirectExecutionOptions;
};

// Stake | UnStake actions
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION;

// ------------------------

export type ActionTypes = StakeActionType;
export type WalletActionType = ActionTypes | null;
