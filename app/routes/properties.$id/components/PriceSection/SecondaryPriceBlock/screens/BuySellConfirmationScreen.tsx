import { FC } from 'react';
import { FormCheckbox } from '~/lib/molecules/FormCheckBox';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '~/lib/atoms/Button';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';
import { InputText } from '~/lib/molecules/Input/Input';
import { Divider } from '~/lib/atoms/Divider';

type BuySellConfirmationScreenProps = {
  actionType: 'buy' | 'sell' | 'otcBuy' | 'otcSell';
  actionCb: () => void;
  tokenPrice: number;
  estFee: number;
  total: number;
  symbol: string;
  currency?: 'USDT';
};

export type FormData = {
  terms: boolean;
  investing: boolean;
  initials: string;
};

const actionLabels = {
  buy: 'Buy',
  sell: 'Sell',
  otcBuy: 'Buy',
  otcSell: 'Sell',
};

export const BuySellConfirmationScreen: FC<BuySellConfirmationScreenProps> = ({
  actionType,
  // actionCb,
  tokenPrice,
  estFee,
  total,
  symbol,
  currency = 'USDT',
}) => {
  const { control, handleSubmit, formState } = useForm<FormData>({
    mode: 'onSubmit',
    defaultValues: {
      initials: '',
      terms: false,
      investing: false,
    },
  });

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
                errorCaption={formState.errors.terms ? 'Required' : null}
                label={
                  <p className="text-content text-body-xs">
                    I agree with the information laid out in the Subscription
                    Agreement, Offering Circular, Form W-9 and any supplements
                    therein.
                  </p>
                }
              />
            )}
            rules={{ required: true }}
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
                errorCaption={formState.errors.investing ? 'Required' : null}
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
            rules={{ required: true }}
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
                  <div className="pr-[1px]">
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
                  </div>
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
              <span>
                {tokenPrice} {currency}
              </span>
            </p>
            <p className="flex justify-between text-body-xs text-content">
              <span>Amount</span>
              <span>10.00 {symbol}</span>
            </p>
            <p className="flex justify-between text-body-xs text-content">
              <span>Est. Fee</span>
              <span>
                {estFee} {symbol}
              </span>
            </p>
            <p className="flex justify-between text-body-xs text-content font-semibold">
              <span>Total Amount</span>
              <span>
                {total} {currency}
              </span>
            </p>
          </div>
          <Divider className="my-4" />
          <p className="text-caption-regular text-content-secondary mb-6">
            By clicking ”{actionLabels[actionType]}”, I adopt the above
            electronic initials as my signiture, and hereby electronically sign
            the documents listed above.
          </p>
          <Button
            type="submit"
            variant={
              actionLabels[actionType].toLowerCase() === 'buy' ? 'green' : 'red'
            }
            className="w-full"
          >
            {actionLabels[actionType]}
          </Button>
        </div>
      </form>
    </div>
  );
};
