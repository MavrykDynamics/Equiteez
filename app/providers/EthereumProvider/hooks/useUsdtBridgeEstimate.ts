import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { useDebounce } from "use-debounce";
import { type Address } from "viem";
import { usePublicClient } from "wagmi";

import { estimateUsdtBridge } from "~/contracts/usdtBridge.estimate";
import { getUsdtBridgeAmountError } from "~/contracts/usdtBridge.contract";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { ETHEREUM_CHAIN } from "../ethereum.config";

export function useUsdtBridgeEstimate(
  account: Address | null,
  amount: BigNumber | undefined,
  recipient: string,
  isEnabled: boolean
) {
  const client = usePublicClient({ chainId: USDT_BRIDGE.chainId });
  const amountText = amount?.toFixed();
  const [debouncedAmount] = useDebounce(amountText, 400);
  const enabled = Boolean(
    isEnabled && account && recipient && !getUsdtBridgeAmountError(amount)
  );
  const query = useQuery({
    queryKey: [
      "ethereum",
      "bridgeEstimate",
      USDT_BRIDGE.chainId,
      USDT_BRIDGE.address,
      account,
      recipient,
      debouncedAmount,
    ],
    enabled: enabled && amountText === debouncedAmount,
    refetchInterval: 15_000,
    staleTime: 15_000,
    retry: 1,
    queryFn: async () => {
      if (!client || !account || !debouncedAmount)
        throw new Error("Bridge estimate inputs are unavailable.");
      return estimateUsdtBridge(
        client,
        account,
        new BigNumber(debouncedAmount),
        recipient
      );
    },
  });
  const data =
    enabled && amountText === debouncedAmount && !query.isError
      ? query.data
      : undefined;
  const currency =
    client?.chain.nativeCurrency ?? ETHEREUM_CHAIN.nativeCurrency;
  const fee =
    data?.fee === null || data?.fee === undefined
      ? null
      : new BigNumber(data.fee).shiftedBy(-currency.decimals);
  return {
    isLoading: enabled && (amountText !== debouncedAmount || query.isLoading),
    fee: fee
      ? fee.isPositive() && fee.lt("0.000001")
        ? "<0.000001"
        : fee.toFixed(6, BigNumber.ROUND_UP)
      : null,
    symbol: currency.symbol,
    time: data?.timeSeconds
      ? `${data.timeSeconds.min}–${data.timeSeconds.max} sec`
      : null,
  };
}
