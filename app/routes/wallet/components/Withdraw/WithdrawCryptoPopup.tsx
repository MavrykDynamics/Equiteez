import React, { useCallback, useMemo, useState } from "react";
import styles from "./styles.module.css";
import classNames from "clsx";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import { InputText } from "~/lib/molecules/Input/Input";
import { Button } from "~/lib/atoms/Button";
import { SelectCoin } from "~/routes/wallet/components/Withdraw/SelectCoin";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { toTokenSlug } from "~/lib/assets";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { EnterTokenAmount } from "~/routes/wallet/components/Withdraw/EnterTokenAmount";
import { ConfirmWithdraw } from "~/routes/wallet/components/Withdraw/ConfirmWithdraw";
import {
  isKTAddress,
  loadContract,
  toTransferParams,
} from "~/lib/utils/helpers";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { useAssetMetadata } from "~/lib/metadata";
import { tokensToAtoms } from "~/lib/utils/formaters";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

const TRANSACTION_FEE = 0.0001;

export function WithdrawCryptoPopup({
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
  const { userAddress } = useUserContext();
  const { dapp } = useWalletContext();
  const { success, bug } = useToasterContext();
  const assetMetadata = useAssetMetadata(toTokenSlug(tokenAddress));

  const [popupState, setPopupState] = useState<"withdraw" | "confirm">(
    "withdraw"
  );

  const { tokensMetadata } = useTokensContext();
  const { userTokensBalances } = useUserContext();

  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [amount, setAmount] = useState("");

  const [errorState, setErrorState] = useState({
    amount: false,
    token: false,
    address: false,
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

  const onChangeAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setWithdrawAddress(e.target.value.trim());

      if (errorState.address) {
        setErrorState((prev) => ({ ...prev, address: false }));
      }
    },
    [errorState.address]
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
      address: !withdrawAddress.trim(),
      amount: tokenAddress
        ? !amount || Number(amount) < 0.1 || Number(amount) > availableWithdraw
        : false,
    };

    setErrorState(errors);

    if (errors.token || errors.address || errors.amount) return;

    setPopupState("confirm");
  }, [tokenAddress, withdrawAddress, amount, availableWithdraw]);

  const handleClosePopup = useCallback(() => {
    handleClose();
    setTimeout(() => {
      setPopupState("withdraw");
      setWithdrawAddress("");
      setAmount("");
      setErrorState({
        amount: false,
        token: false,
        address: false,
      });
      setTokenAddress("");
    }, 10);
  }, [handleClose, setTokenAddress]);

  const confirmWithdraw = useCallback(async () => {
    try {
      const tezos = dapp?.tezos();
      const tokenSlug = toTokenSlug(tokenAddress);
      if (!tezos || !userAddress) throw new Error("Tezos not found");
      if (!assetMetadata) throw new Error("Metadata not found");

      if (isKTAddress(tokenAddress)) {
        const actualAmount = tokensToAtoms(amount, assetMetadata.decimals);

        const transferParams = await toTransferParams(
          tezos,
          tokenSlug,
          assetMetadata,
          userAddress,
          withdrawAddress,
          actualAmount
        );

        const contract = await loadContract(tezos, tokenAddress);
        await contract.methodsObject.transfer(transferParams).send();
      } else {
        const transferParams = await toTransferParams(
          tezos,
          tokenSlug,
          assetMetadata,
          userAddress,
          withdrawAddress,
          amount
        );

        await tezos.wallet.transfer(transferParams).send();
      }
      success(
        "Withdrawal Complete",
        "Your withdrawal has been processed successfully."
      );
      handleClosePopup();
    } catch (err) {
      if (err.message === "Declined") {
        return;
      }
      bug("Something went wrong, try again later.", "Error");

      console.error(err);
    }
  }, [
    amount,
    assetMetadata,
    bug,
    dapp,
    handleClosePopup,
    success,
    tokenAddress,
    userAddress,
    withdrawAddress,
  ]);

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
            network="MVRK"
            withdrawAddress={withdrawAddress}
            tokenSymbol={selectedToken?.symbol || ""}
            fee={TRANSACTION_FEE}
          />
        ) : (
          <>
            <div className="flex flex-col items-center justify-center gap-[8px]">
              <Text size="largeBody" weight="semibold">Withdraw Crypto</Text>
              <Text className="text-center">
                Send crypto from your wallet to an external address. Make sure
                the address is correct before confirming.
              </Text>
            </div>
            <div className="flex flex-col gap-[24px]">
              <SelectCoin
                error={errorState.token}
                setTokenAddress={onChangeTokenAddress}
                tokenAddress={tokenAddress}
              />

              <div className="flex flex-col gap-[8px]">
                <Text size="smallBody">Withdraw To</Text>
                <div className="flex flex-col gap-[8px]">
                  <div className={styles.textItem}>
                    <span>
                      <Text weight="semibold">MVRK</Text>{" "}
                      <Text color="extraLightSand">Mavryk Network (MRC20)</Text>
                    </span>
                  </div>
                  <InputText
                    errorCaption={errorState.address ? "Enter address" : ""}
                    className="h-[45px]"
                    placeholder="Enter Address"
                    value={withdrawAddress}
                    onChange={onChangeAddress}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-[32px] items-center">
                <EnterTokenAmount
                  error={errorState.amount}
                  amount={amount}
                  tokenAddress={tokenAddress}
                  setAmount={onChangeAmount}
                  feeText="Network Fee"
                  feeValue={TRANSACTION_FEE}
                  availableSymbol={selectedToken?.symbol || ""}
                  availableText="Available Withdraw"
                  availableValue={availableWithdraw}
                />

                <Button
                  onClick={handleGoToConfirm}
                  className={styles.withdrawBtn}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </CustomPopup>
  );
}
