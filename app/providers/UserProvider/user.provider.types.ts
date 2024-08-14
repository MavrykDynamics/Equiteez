import { z } from 'zod';

// types

export type TokenAddressType = string;

import {
  userTzktTokenBalancesSchema,
  userTzktWSAccountSchema,
} from './helpers/user.schemes';
import BigNumber from 'bignumber.js';

// User tokens types
export type UserTzktTokensBalancesType = z.infer<
  typeof userTzktTokenBalancesSchema
>;
export type UserTzktAccountType = z.infer<typeof userTzktWSAccountSchema>;
export type EmptyUserTzktAccountType = z.infer<typeof userTzktWSAccountSchema>;
export type UserTzktWSAccountType = z.infer<typeof userTzktWSAccountSchema>;

export type UserTzKtTokenBalances = {
  userAddress: string | null;
  tokens: Record<TokenAddressType, BigNumber>;
};

// Context types
export type UserContext = UserContextStateType & {
  isLoading: boolean;

  // actions
  connect: () => void;
  signOut: () => void;
  changeUser: () => void;
};

export type UserContextStateType = {
  userAddress: string | null;
  isAdmin: boolean;

  userTokensBalances: Record<TokenAddressType, BigNumber>;
};
