import { FC, useCallback, useMemo, useState } from 'react';
import { pickDodoContractBasedOnToken } from '~/consts/contracts';
import {
  depositBaseToken,
  depositQuoteToken,
  withdrawBaseToken,
  withdrawQuoteToken,
} from '~/contracts/dodo.contract';
import { useContractAction } from '~/contracts/hooks/useContractAction';
import { getStatusLabel } from '~/lib/ui/use-status-flag';
import { Button } from '~/lib/atoms/Button';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { toTokenSlug } from '~/lib/assets';

const useAdminAction = (amount: number, tokenAddress: string) => {
  const { tokensMetadata } = useTokensContext();
  const slug = useMemo(() => toTokenSlug(tokenAddress), [tokenAddress]);

  const selectedAssetMetadata = useMemo(
    () => tokensMetadata[slug],
    [slug, tokensMetadata]
  );
  const depositProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
      rwaTokenAddress: tokenAddress,
      tokensAmount: amount,
      decimals: selectedAssetMetadata?.decimals,
    }),
    [tokenAddress, amount, selectedAssetMetadata]
  );

  const { invokeAction: handleBaseTokenDeposit, status: depositBaseStatus } =
    useContractAction(depositBaseToken, depositProps);

  const { invokeAction: handleQuoteTokenDeposit, status: depositQuoteStatus } =
    useContractAction(depositQuoteToken, depositProps);

  const withdrawProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
      tokensAmount: amount,
      decimals: selectedAssetMetadata?.decimals,
    }),
    [amount, tokenAddress, selectedAssetMetadata]
  );

  const { invokeAction: handleBaseTokenWithdraw, status: withdrawBaseStatus } =
    useContractAction(withdrawBaseToken, withdrawProps);

  const {
    invokeAction: handleQuoteTokenWithdraw,
    status: withdrawQuoteStatus,
  } = useContractAction(withdrawQuoteToken, withdrawProps);

  return {
    handleBaseTokenDeposit,
    handleQuoteTokenDeposit,
    handleBaseTokenWithdraw,
    handleQuoteTokenWithdraw,
    depositBaseStatus,
    depositQuoteStatus,
    withdrawBaseStatus,
    withdrawQuoteStatus,
  };
};

// Temporary admin actions for exchange page actions
export const AdminScreen: FC<{ symbol: string; tokenAddress: string }> = ({
  symbol,
  tokenAddress,
}) => {
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [amount, setAmount] = useState<number | string>(Number(''));

  const {
    handleBaseTokenDeposit,
    handleQuoteTokenDeposit,
    handleBaseTokenWithdraw,
    handleQuoteTokenWithdraw,
    depositBaseStatus,
    depositQuoteStatus,
    withdrawBaseStatus,
    withdrawQuoteStatus,
  } = useAdminAction(Number(amount), tokenAddress);

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
            The entered amount will work for all actions!
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
              {getStatusLabel(depositBaseStatus, 'Deposit Base')}
            </Button>
            <Button className="w-full" onClick={handleQuoteTokenDeposit}>
              {getStatusLabel(depositQuoteStatus, 'Deposit Quote')}
            </Button>
            <Button className="w-full" onClick={handleBaseTokenWithdraw}>
              {getStatusLabel(withdrawBaseStatus, 'Withdraw Base')}
            </Button>
            <Button className="w-full" onClick={handleQuoteTokenWithdraw}>
              {getStatusLabel(withdrawQuoteStatus, 'Withdraw Quote')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
