import { FC } from 'react';
import { Button } from '~/lib/atoms/Button';

type ConfirmBuyScreenProps = {};

export const ConfirmBuyScreen: FC<ConfirmBuyScreenProps> = () => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();

  const [price, setPrice] = useState<number | string>('');
  const [amount, setAmount] = useState<number | string>('');

  const handleBuy = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }
      await buy({
        tezos,
        marketContractAddress: pickMarketBasedOnSymbol[symbol],
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(price),
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }, [amount, dapp, dispatch, price, symbol]);

  return (
    <div className="flex flex-col flex-1">
      <Button>Confirm</Button>
    </div>
  );
};
