import { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchWallet, fetchWalletPortfolio } from "~/lib/apis/rwa";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import type {
  PortfolioContextType,
  PortfolioProviderProps,
} from "~/providers/PortfolioProvider/portfolio.provider.types";

const portfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const { userAddress } = useUserContext();
  const { isAuthenticated } = useAuthContext();

  const walletQuery = useQuery({
    queryKey: ["rwa-wallet", userAddress],
    queryFn: () =>
      fetchWallet({
        walletAddress: userAddress || "",
      }),
    retry: false,
    enabled: isAuthenticated && Boolean(userAddress),
  });
  const portfolioQuery = useQuery({
    queryKey: ["rwa-wallet-portfolio", userAddress],
    queryFn: () =>
      fetchWalletPortfolio({
        walletAddress: userAddress || "",
      }),
    enabled: isAuthenticated && Boolean(userAddress),
  });

  const contextValue = useMemo<PortfolioContextType>(
    () => ({
      userAddress,
      portfolio: portfolioQuery.data,
      wallet: walletQuery.data,
      isLoading:
        walletQuery.isLoading ||
        walletQuery.isFetching ||
        walletQuery.isPending ||
        portfolioQuery.isLoading ||
        portfolioQuery.isFetching ||
        portfolioQuery.isPending,
    }),
    [
      portfolioQuery.data,
      portfolioQuery.isFetching,
      portfolioQuery.isLoading,
      portfolioQuery.isPending,
      userAddress,
      walletQuery.data,
      walletQuery.isFetching,
      walletQuery.isLoading,
      walletQuery.isPending,
    ]
  );

  return (
    <portfolioContext.Provider value={contextValue}>
      {children}
    </portfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  const context = useContext(portfolioContext);

  if (!context) {
    throw new Error(
      "usePortfolioContext must be used within PortfolioProvider"
    );
  }

  return context;
}
