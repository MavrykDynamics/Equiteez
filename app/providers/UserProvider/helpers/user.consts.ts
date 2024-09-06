import {
  UserContextStateType,
  UserTzKtTokenBalances,
} from '../user.provider.types';

export const DEFAULT_USER: UserContextStateType = {
  userAddress: null,
  userTokensBalances: {},
};

export const DEFAULT_USER_TZKT_TOKENS: UserTzKtTokenBalances = {
  userAddress: null,
  tokens: {},
};
