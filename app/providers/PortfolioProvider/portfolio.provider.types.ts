import type { PropsWithChildren } from "react";

import type {
  WalletPortfolioResponseType,
  WalletResponseType,
} from "~/lib/apis/rwa/wallet/wallet.types";

export type PortfolioProviderProps = PropsWithChildren;

export type PortfolioContextType = {
  userAddress: string | null;
  portfolio?: WalletPortfolioResponseType;
  wallet?: WalletResponseType;
  isLoading: boolean;
};
