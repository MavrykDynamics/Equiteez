import { useCallback } from 'react';
import { pickOrderbookContract } from '~/consts/contracts';
import { orderbookBuy, orderbookSell } from '~/contracts/orderbook.contract';
import {
  STATUS_IDLE,
  STATUS_PENDING,
  useStatusFlag,
} from '~/hooks/use-status-flag';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';

export const useOrderbookBuySellActions = (
  price: number,
  amount: number,
  tokenAddress: string
) => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();

  const handleOrderbookSell = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }
      await orderbookSell({
        tezos,
        marketContractAddress: pickOrderbookContract[tokenAddress],
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(price),
      });
    } catch (e) {
      // TODO handle Errors with context
      console.log(e, 'Sell contract error');
    }
  }, [amount, dapp, dispatch, price, tokenAddress]);

  const handlerOrderbookBuy = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }
      await orderbookBuy({
        tezos,
        marketContractAddress: pickOrderbookContract[tokenAddress],
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(price),
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }, [amount, dapp, dispatch, price, tokenAddress]);

  return {
    handleOrderbookSell,
    handlerOrderbookBuy,
    status,
    isLoading,
  };
};
