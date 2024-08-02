import { FC, useCallback, useState } from 'react';
import { pickDodoContractBasedOnToken } from '~/consts/contracts';
import { depositBaseToken, depositQuoteToken } from '~/contracts/dodo.contract';
import {
  getStatusLabel,
  STATUS_IDLE,
  STATUS_PENDING,
  useStatusFlag,
} from '~/hooks/use-status-flag';
import { Button } from '~/lib/atoms/Button';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';

const useAdminAction = (amount: number, tokenAddress: string) => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();

  const handleBaseTokenDeposit = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }

      await depositBaseToken({
        tezos,
        dispatch,
        dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
        rwaTokenAddress: tokenAddress,
        tokensAmount: amount,
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }, [amount, dapp, dispatch, tokenAddress]);

  const handleQuoteTokenDeposit = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }

      await depositQuoteToken({
        tezos,
        dispatch,
        dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
        rwaTokenAddress: tokenAddress,
        tokensAmount: amount,
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }, [amount, dapp, dispatch, tokenAddress]);

  return {
    handleBaseTokenDeposit,
    handleQuoteTokenDeposit,
    status,
    isLoading,
  };
};

// Temporary admin actions for exchange page actions
export const AdminScreen: FC<{ symbol: string; tokenAddress: string }> = ({
  symbol,
  tokenAddress,
}) => {
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [amount, setAmount] = useState<number | string>(Number(''));

  const { handleBaseTokenDeposit, handleQuoteTokenDeposit, status } =
    useAdminAction(Number(amount), tokenAddress);

  const handleAdminChange = useCallback(() => {
    setIsAdminActive(!isAdminActive);
  }, [isAdminActive]);

  return (
    <section className="mt-4">
      <Button onClick={handleAdminChange}>
        {isAdminActive ? 'Hide Actions' : 'Show Actions'}
      </Button>
      {isAdminActive && (
        <div className="flex flex-col">
          <div className="my-4 text-blue-500">
            <span className="uppercase font-semibold text-black">
              NOTE:&nbsp;
            </span>
            The entered amount will work with both actions
          </div>
          <div
            className={`w-full flex justify-between eq-input py-3 px-[14px]`}
          >
            <span className="text-content-secondary opacity-50">Amount</span>

            <span className="flex gap-1">
              <span className="">
                <input
                  name="amount"
                  type="number"
                  min={1}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Minimum 1"
                  className="w-full bg-transparent focus:outline-none text-right"
                ></input>
              </span>
              <span className="">{symbol}</span>
            </span>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <Button className="w-full" onClick={handleBaseTokenDeposit}>
              {getStatusLabel(status, 'Deposit Base')}
            </Button>
            <Button className="w-full" onClick={handleQuoteTokenDeposit}>
              {getStatusLabel(status, 'Deposit Quote')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
