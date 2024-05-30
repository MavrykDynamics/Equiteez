import { z } from 'zod';

// types

export type TokenAddressType = string;

import {
  userTzktTokenBalancesSchema,
  userTzktWSAccountSchema,
} from './helpers/user.schemes';

// User tokens types
export type UserTzktTokensBalancesType = z.infer<
  typeof userTzktTokenBalancesSchema
>;
export type UserTzktAccountType = z.infer<typeof userTzktWSAccountSchema>;
export type EmptyUserTzktAccountType = z.infer<typeof userTzktWSAccountSchema>;
export type UserTzktWSAccountType = z.infer<typeof userTzktWSAccountSchema>;

export type UserTzKtTokenBalances = {
  userAddress: string | null;
  tokens: Record<TokenAddressType, number>;
};

// Context types
export type UserContext = UserContextStateType & {
  isLoading: boolean;
  isUserRestored: boolean;

  // actions
  connect: () => void;
  signOut: () => void;
};

export type UserContextStateType = {
  userAddress: string | null;

  userTokensBalances: Record<TokenAddressType, number>;
};
