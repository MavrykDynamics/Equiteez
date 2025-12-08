import React, { useCallback, useMemo, useState } from "react";
import styles from "./styles.module.css";
import classNames from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import { Button } from "~/lib/atoms/Button";
import { SelectCoin } from "~/routes/wallet/components/Withdraw/SelectCoin";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { toTokenSlug } from "~/lib/assets";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { EnterTokenAmount } from "~/routes/wallet/components/Withdraw/EnterTokenAmount";
import { ConfirmWithdraw } from "~/routes/wallet/components/Withdraw/ConfirmWithdraw";
import HouseIcon from "app/icons/wallet/house.svg?react";
import { Icon } from "~/lib/atoms/Icon";

const TRANSACTION_FEE = 0.1;

export function WithdrawSpotPopup({
  isOpen,
  handleClose,
  tokenAddress,
  setTokenAddress,
}: {
  isOpen: boolean;
  handleClose: () => void;
  tokenAddress: string;
  setTokenAddress: (value: string) => void;
}) {
  const [popupState, setPopupState] = useState<"withdraw" | "confirm">(
    "withdraw"
  );

  const { tokensMetadata } = useTokensContext();
  const { userTokensBalances } = useUserContext();

  const [amount, setAmount] = useState("");

  const [errorState, setErrorState] = useState({
    amount: false,
    token: false,
  });

  const selectedToken = useMemo(
    () => (tokenAddress ? tokensMetadata[toTokenSlug(tokenAddress)] : null),
    [tokenAddress, tokensMetadata]
  );
  const availableWithdraw = useMemo(
    () =>
      tokenAddress ? (userTokensBalances[tokenAddress]?.toNumber() ?? 0) : 0,
    [tokenAddress, userTokensBalances]
  );

  const onChangeTokenAddress = useCallback(
    (value: string) => {
      setTokenAddress(value);

      if (errorState.token) {
        setErrorState((prev) => ({ ...prev, token: false }));
      }
    },
    [errorState.token, setTokenAddress]
  );

  const onChangeAmount = useCallback(
    (value: string) => {
      setAmount(value);

      if (errorState.amount) {
        setErrorState((prev) => ({ ...prev, amount: false }));
      }
    },
    [errorState.amount]
  );

  const handleGoToConfirm = useCallback(() => {
    const errors = {
      token: !tokenAddress.trim(),
      amount: tokenAddress
        ? !amount || Number(amount) < 0.1 || Number(amount) > availableWithdraw
        : false,
    };

    setErrorState(errors);

    if (errors.token || errors.amount) return;

    setPopupState("confirm");
  }, [tokenAddress, amount, availableWithdraw]);

  const handleClosePopup = useCallback(() => {
    handleClose();
    setPopupState("withdraw");
    setAmount("");
    setErrorState({
      amount: false,
      token: false,
    });
    setTokenAddress("");
  }, [handleClose, setTokenAddress]);

  //TODO add withdraw logic
  const confirmWithdraw = useCallback(() => {
    console.log(amount); // token amount
    console.log(tokenAddress); // token address
  }, [amount, tokenAddress]);

  return (
    <CustomPopup
      isOpen={isOpen}
      contentPosition={"center"}
      className={classNames(
        "max-h-screen px-11 py-14 z-100 relative",
        styles.popupWrapper
      )}
    >
      <button className="absolute top-6 right-7 z-10">
        <CloseIcon
          className="w-6 h-6 cursor-pointer relative text-content stroke-current"
          onClick={handleClosePopup}
        />
      </button>
      <div className={styles.contentWrapper}>
        {popupState === "confirm" ? (
          <ConfirmWithdraw
            confirm={confirmWithdraw}
            amount={+amount}
            withdrawAddress=""
            network="Spot Account"
            tokenSymbol={selectedToken?.symbol || ""}
            fee={TRANSACTION_FEE}
          />
        ) : (
          <>
            <div className="flex flex-col items-center justify-center gap-[16px]">
              <div className="flex flex-col items-center justify-center gap-[12px]">
                <Text size="largeBody" weight="semibold">
                  Withdraw Your Funds
                </Text>
                <Text className="text-center">Withdraw to Spot Wallet</Text>
              </div>
              <div className="flex items-center justify-center gap-[12px]">
                <div className={styles.chip}>
                  <Text>
                    <HouseIcon className="text-content stroke-current" />
                  </Text>
                  <Text size="smallBody" weight="semibold">
                    RWA Account
                  </Text>
                </div>

                <Text>
                  <Icon icon="arrow-right" className="text-content text-content stroke-current" />
                </Text>

                <div className={styles.chip}>
                  <Text>
                    <Icon icon="wallet" />
                  </Text>
                  <Text size="smallBody" weight="semibold">
                    Spot
                  </Text>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[24px] items-center">
              <SelectCoin
                error={errorState.token}
                setTokenAddress={onChangeTokenAddress}
                tokenAddress={tokenAddress}
              />

              <EnterTokenAmount
                error={errorState.amount}
                amount={amount}
                tokenAddress={tokenAddress}
                setAmount={onChangeAmount}
                feeText="Transaction Fee"
                feeValue={TRANSACTION_FEE}
                availableSymbol={selectedToken?.symbol || ""}
                availableText="Available"
                availableValue={availableWithdraw}
              />

              <Button
                onClick={handleGoToConfirm}
                className={styles.withdrawBtn}
              >
                Withdraw
              </Button>
            </div>
          </>
        )}
      </div>
    </CustomPopup>
  );
}
