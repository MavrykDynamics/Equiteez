import { rwaApi } from "~/lib/apis/rwa/client";
import { WalletSchema } from "~/lib/apis/rwa/wallet/wallet.schema";
import { WalletResponseType } from "~/lib/apis/rwa/wallet/wallet.types";

type FetchWalletParams = {
  walletAddress: string;
};

export const fetchWallet = async ({
  walletAddress,
}: FetchWalletParams): Promise<WalletResponseType> => {
  const { data } = await rwaApi.get(`/wallets/${walletAddress}`);

  return WalletSchema.parse(data);
};
