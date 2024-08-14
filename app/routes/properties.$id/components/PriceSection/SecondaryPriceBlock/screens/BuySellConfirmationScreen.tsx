import { FC } from 'react';
import { FormCheckbox } from '~/lib/molecules/FormCheckBox';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '~/lib/atoms/Button';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';
import { InputText } from '~/lib/molecules/Input/Input';
import { Divider } from '~/lib/atoms/Divider';
import { Link } from '@remix-run/react';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import clsx from 'clsx';
import Money from '~/lib/atoms/Money';

type BuySellConfirmationScreenProps = {
  actionType: 'buy' | 'sell' | 'otcBuy' | 'otcSell';
  actionCb: () => void;
  tokenPrice: number;
  estFee: number;
  total: number;
  amount: number | string;
  estate: SecondaryEstate;
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
  actionCb,
  tokenPrice,
  estFee,
  total,
  amount,
  estate,
  currency = 'USDT',
}) => {
  const { symbol } = estate;
  const { control, handleSubmit, formState } = useForm<FormData>({
    mode: 'onSubmit',
    defaultValues: {
      initials: '',
      terms: false,
      investing: false,
    },
  });

  // call contract action // try catch are handled within that action
  const onSubmit = async ({ initials, investing, terms }: FormData) => {
    if (terms && initials && investing) {
      actionCb();
    }
  };

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
                  <p className="text-content text-body-xs max-w-[521px] ">
                    I agree with the information laid out in the&nbsp;
                    <Link to="/" className="text-blue-700 text-nowrap">
                      Subscription Agreement
                    </Link>
                    ,&nbsp;
                    <br />
                    <Link to="/" className="text-blue-700">
                      Offering Circular
                    </Link>
                    ,&nbsp;
                    <Link to="/" className="text-blue-700">
                      Form W-9
                    </Link>
                    &nbsp; and any supplements therein.
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
                  <p className="text-content text-body-xs max-w-[521px]">
                    I understand investing with the intention of holdling my
                    securities for the target investment period, and that
                    Equiteez will{' '}
                    <span className="font-semibold">not offer refunds</span> on
                    my investment outside of the 24 hour cancellation window. To
                    learn more about liquidity, check out the{' '}
                    <Link to="/" className="text-blue-700">
                      FAQ.
                    </Link>
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
              rules={{ required: true }}
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
              <div>
                <Money shortened smallFractionFont={false}>
                  {amount}
                </Money>
                &nbsp;
                {symbol}
              </div>
            </p>
            <p className="flex justify-between text-body-xs text-content">
              <span>Est. Fee</span>
              <span>
                {estFee} {symbol}
              </span>
            </p>
            <div className="flex justify-between text-body-xs text-content font-semibold">
              <span>Total Amount</span>
              <div>
                <Money shortened smallFractionFont={false}>
                  {total}
                </Money>
                &nbsp;
                {currency}
              </div>
            </div>
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
              actionLabels[actionType].toLowerCase() === 'buy'
                ? 'custom'
                : 'red'
            }
            className={clsx(
              'w-full',
              actionLabels[actionType].toLowerCase() === 'buy' &&
                'bg-green-500 text-content hover:bg-green-300'
            )}
          >
            {actionLabels[actionType]}
          </Button>
        </div>
      </form>
    </div>
  );
};
