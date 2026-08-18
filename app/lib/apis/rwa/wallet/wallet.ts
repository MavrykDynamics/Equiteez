import { rwaApi } from "~/lib/apis/rwa/client";
import {
  WalletActivitySummarySchema,
  WalletPortfolioHistorySchema,
  WalletPortfolioSchema,
  WalletSchema,
} from "~/lib/apis/rwa/wallet/wallet.schema";
import {
  WalletActivitySummaryResponseType,
  WalletPortfolioHistoryResponseType,
  WalletPortfolioResponseType,
  WalletResponseType,
} from "~/lib/apis/rwa/wallet/wallet.types";

type FetchWalletParams = {
  walletAddress: string;
};

type FetchWalletPortfolioHistoryParams = {
  walletAddress: string;
  currency?: string;
  range?: string;
};

export const fetchWallet = async ({
  walletAddress,
}: FetchWalletParams): Promise<WalletResponseType> => {
  const { data } = await rwaApi.get(`/wallets/${walletAddress}`);

  return WalletSchema.parse(data);
};

export const fetchWalletPortfolio = async ({
  walletAddress,
}: FetchWalletParams): Promise<WalletPortfolioResponseType> => {
  const { data } = await rwaApi.get(`/wallets/${walletAddress}/portfolio`);

  return WalletPortfolioSchema.parse(data);
};

export const fetchWalletPortfolioHistory = async ({
  walletAddress,
  currency = "usd",
  range = "1d",
}: FetchWalletPortfolioHistoryParams): Promise<WalletPortfolioHistoryResponseType> => {
  const query = new URLSearchParams({
    currency,
    range,
  });
  const { data } = await rwaApi.get(
    `/wallets/${walletAddress}/portfolio/history?${query.toString()}`
  );

  return WalletPortfolioHistorySchema.parse(data);
};

export const fetchWalletActivitySummary = async ({
  walletAddress,
}: FetchWalletParams): Promise<WalletActivitySummaryResponseType> => {
  const { data } = await rwaApi.get(`/wallets/${walletAddress}/activity/summary`);

  return WalletActivitySummarySchema.parse(data);
};
