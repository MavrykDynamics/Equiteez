import { FC, useCallback } from 'react';
import { pickMarketBasedOnSymbol } from '~/consts/contracts';
import {
  STATUS_IDLE,
  STATUS_PENDING,
  useStatusFlag,
} from '~/hooks/use-status-flag';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';
import { buy } from '../../actions/financial.actions';
import { FormCheckbox } from '~/lib/molecules/FormCheckBox';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '~/lib/atoms/Button';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';
import { InputText } from '~/lib/molecules/Input/Input';
import { Divider } from '~/lib/atoms/Divider';

type ConfirmBuyScreenProps = {
  price: number;
  amount: number;
  symbol: string;
};

type FormData = {
  terms: boolean;
  investing: boolean;
  initials: string;
};
export const ConfirmBuyScreen: FC<ConfirmBuyScreenProps> = ({
  price,
  amount,
  symbol,
}) => {
  const { control, handleSubmit } = useForm<FormData>({
    mode: 'onSubmit',
    defaultValues: {
      initials: '',
    },
  });

  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();

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

  const onSubmit = (data: unknown) => console.log(data);

  return (
    <div className="flex flex-col flex-1">
      <form className="flex flex-col h-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3 flex-1">
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormCheckbox
                ref={ref}
                onChange={onChange} // send value to hook form
                onBlur={onBlur} // notify when input is touched/blur
                checked={value}
                label={
                  <p className="text-content text-body-xs">
                    I agree with the information laid out in the Subscription
                    Agreement, Offering Circular, Form W-9 and any supplements
                    therein.
                  </p>
                }
              />
            )}
            name="terms"
            control={control}
          />
          <Controller
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormCheckbox
                ref={ref}
                onChange={onChange} // send value to hook form
                onBlur={onBlur} // notify when input is touched/blur
                checked={value}
                label={
                  <p className="text-content text-body-xs">
                    I understand investing with the intention of holdling my
                    securities for the target investment period, and that
                    Equiteez will not offer refunds on my investment outside of
                    the 24 hour cancellation window. To learn more about
                    liquidity, check out the FAQ.
                  </p>
                }
              />
            )}
            name="investing"
            control={control}
          />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <span className="text-body-xs text-content w-[364px]">
                Please enter your First and Last name initials (ex. JS)
              </span>
              <InfoTooltip className="size-6" content={'Initials'} />
            </div>
            <Controller
              render={({
                field: { onChange, onBlur, value, ref },
                formState: { errors },
              }) => {
                return (
                  <InputText
                    ref={ref}
                    errorCaption={
                      errors.initials ? 'Enter your initials' : undefined
                    }
                    value={value.slice(0, 2).toUpperCase()}
                    onChange={onChange} // send value to hook form
                    onBlur={onBlur} // notify when input is touched/blur
                    placeholder="JS"
                  />
                );
              }}
              name="initials"
              control={control}
              rules={{ required: true, maxLength: 2 }}
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-2">
            <p className="flex justify-between text-body-xs text-content">
              <span>Token Price</span>
              <span>45 USDT</span>
            </p>
            <p className="flex justify-between text-body-xs text-content">
              <span>Amount</span>
              <span>10.00 NMD</span>
            </p>
            <p className="flex justify-between text-body-xs text-content">
              <span>Est. Fee</span>
              <span>0.21 NMD</span>
            </p>
            <p className="flex justify-between text-body-xs text-content font-semibold">
              <span>Total Amount</span>
              <span>450.9 USDT</span>
            </p>
          </div>
          <Divider className="my-4" />
          <p className="text-caption-regular text-content-secondary mb-6">
            By clicking ”Buy”, I adopt the above electronic initials as my
            signiture, and hereby electronically sign the documents listed
            above.
          </p>
          <Button type="submit" className="w-full">
            Buy
          </Button>
        </div>
      </form>
    </div>
  );
};
