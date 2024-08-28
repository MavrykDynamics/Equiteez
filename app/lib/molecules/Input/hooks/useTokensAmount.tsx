import { useCallback, useMemo, useState } from 'react';
import { parseTokensValue } from '../utils';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';

export const useTokensAmount = (tokenAddress: string) => {
  const { tokensMetadata } = useTokensContext();
  const decimals = useMemo(
    () => tokensMetadata[tokenAddress]?.decimals,
    [tokenAddress, tokensMetadata]
  );

  const [tokensState, setTokensState] = useState<StringRecord<string | number>>(
    {
      amount: '',
      previewAmount: '',
    }
  );

  const handleAmountChange = useCallback(
    (x: string | number) => {
      const { originalCalculatedNumber, fixedNumber } = parseTokensValue(
        x.toString(),
        decimals
      );

      setTokensState({
        amount: originalCalculatedNumber,
        previewAmount: fixedNumber,
      });
    },
    [decimals]
  );

  return {
    handleAmountChange,
    amount: tokensState.amount,
    previewAmount: tokensState.previewAmount,
  };
};
