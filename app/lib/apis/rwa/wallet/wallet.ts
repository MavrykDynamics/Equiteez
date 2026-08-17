import { rwaApi } from "~/lib/apis/rwa/client";
import {
  WalletPortfolioSchema,
  WalletSchema,
} from "~/lib/apis/rwa/wallet/wallet.schema";
import {
  WalletPortfolioResponseType,
  WalletResponseType,
} from "~/lib/apis/rwa/wallet/wallet.types";

type FetchWalletParams = {
  walletAddress: string;
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
