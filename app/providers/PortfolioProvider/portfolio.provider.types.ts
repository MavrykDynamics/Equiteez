import type { PropsWithChildren } from "react";

import type { WalletResponseType } from "~/lib/apis/rwa/wallet/wallet.types";

export type PortfolioProviderProps = PropsWithChildren;

export type PortfolioContextType = {
  wallet?: WalletResponseType;
  isLoading: boolean;
};
