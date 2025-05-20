import { FC } from "react";
import { FormCheckbox } from "~/lib/molecules/FormCheckBox";
import { useForm, Controller } from "react-hook-form";
import { Button } from "~/lib/atoms/Button";
import { InputText } from "~/lib/molecules/Input/Input";
import { Divider } from "~/lib/atoms/Divider";
import clsx from "clsx";
import {
  getStatusLabel,
  STATUS_CONFIRMING,
  STATUS_PENDING,
  StatusFlag,
} from "~/lib/ui/use-status-flag";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";

type BuySellConfirmationScreenProps = {
  actionType: "buy" | "sell" | "otcBuy" | "otcSell";
  actionCb: () => void;
  status: StatusFlag;
};

export type FormData = {
  terms: boolean;
  investing: boolean;
  initials: string;
};

const actionLabels = {
  buy: "Buy",
  sell: "Sell",
  otcBuy: "Buy",
  otcSell: "Sell",
};

export const BuySellConfirmationScreen: FC<BuySellConfirmationScreenProps> = ({
  actionType,
  actionCb,
  status,
}) => {
  const isLoading = status === STATUS_PENDING || status === STATUS_CONFIRMING;
  const { control, handleSubmit, formState } = useForm<FormData>({
    mode: "onSubmit",
    defaultValues: {
      initials: "",
      terms: false,
      investing: false,
    },
  });

  // call contract action // try catch are handled within that action
  const onSubmit = async ({ initials, investing, terms }: FormData) => {
    if (terms && initials && investing && !isLoading) {
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
                errorCaption={formState.errors.terms ? "Required" : null}
                label={
                  <p className="text-content text-body-xs max-w-[521px] ">
                    I agree with the information laid out in the&nbsp;
                    <CustomLink
                      to="/"
                      className="text-blue-700 text-nowrap"
                      aria-disabled="true"
                      disabled
                    >
                      Subscription Agreement
                    </CustomLink>
                    ,&nbsp;
                    <br />
                    <CustomLink
                      to="/"
                      className="text-blue-700"
                      aria-disabled="true"
                      disabled
                    >
                      Offering Circular
                    </CustomLink>
                    &nbsp;and any supplements therein.
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
                errorCaption={formState.errors.investing ? "Required" : null}
                label={
                  <p className="text-content text-body-xs max-w-[521px]">
                    I understand investing with the intention of holdling my
                    securities for the target investment period, and that
                    Equiteez will{" "}
                    <span className="font-semibold">not offer refunds</span> on
                    my investment outside of the 24 hour cancellation window. To
                    learn more about liquidity, check out the{" "}
                    <CustomLink
                      to="/"
                      className="text-blue-700"
                      aria-disabled="true"
                      disabled
                    >
                      FAQ.
                    </CustomLink>
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
              {/* <InfoTooltip className="size-6" content={'Initials'} /> */}
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
                        errors.initials ? "Enter your initials" : undefined
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
          <Divider className="my-4" />
          <p className="text-caption-regular text-content-secondary mb-6">
            By clicking ”{actionLabels[actionType]}”, I adopt the above
            electronic initials as my signiture, and hereby electronically sign
            the documents listed above.
          </p>
          <Button
            type="submit"
            isLoading={isLoading}
            className={clsx(
              "w-full",
              actionLabels[actionType].toLowerCase() === "buy" &&
                "bg-green-500 text-content hover:bg-green-300"
            )}
          >
            {getStatusLabel(status, actionLabels[actionType])}
          </Button>
        </div>
      </form>
    </div>
  );
};
