import { TransactionWalletOperation } from '@mavrykdynamics/taquito';
import { BatchWalletOperation } from '@mavrykdynamics/taquito/dist/types/wallet/batch-operation';
import { WalletOperationError } from '~/errors/error';
import { WalletErrorPayload } from '~/errors/error.type';
import { STAKE_ACTION, UNSTAKE_ACTION } from './consts';

export type ActionErrorReturnType = {
  actionSuccess: boolean;
  error: WalletErrorPayload | WalletOperationError;
};
export type ActionSuccessReturnType = {
  actionSuccess: boolean;
  operation: TransactionWalletOperation | BatchWalletOperation;
};

// Stake | UnStake actions
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION;

// ------------------------

export type ActionTypes = StakeActionType;
export type WalletActionType = ActionTypes | null;
