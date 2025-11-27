import React, { useCallback, useEffect, useState } from "react";
import styles from "../DepositWithdraw/styles.module.css";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import { Button } from "~/lib/atoms/Button";
import { Text } from "~/lib/atoms/Typography/Text";
import CryproIcon from "~/icons/wallet/crypto.svg?react";
import SpotIcon from "~/icons/wallet/spot.svg?react";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useLocation } from "@remix-run/react";
import { WithdrawCryptoPopup } from "~/routes/wallet/components/Withdraw/WithdrawCryptoPopup";
import { WithdrawSpotPopup } from "~/routes/wallet/components/Withdraw/WithdrawSpotPopup";
import {
  PHONE_MAX_WIDTH,
  useWindowDimensions,
} from "~/hooks/useWindowDimensions";

export function Withdraw() {
  const { userAddress } = useUserContext();
  const location = useLocation();

  const [isOpenWithdrawCryptoPopup, setIsOpenWithdrawCryptoPopup] =
    useState(false);
  const [isOpenWithdrawSpotPopup, setIsOpenWithdrawSpotPopup] = useState(false);

  const toggleOpenWithdrawCryptoPopup = useCallback(() => {
    setIsOpenWithdrawCryptoPopup((prevState) => !prevState);
  }, []);
  const toggleOpenWithdrawSpotPopup = useCallback(() => {
    setIsOpenWithdrawSpotPopup((prevState) => !prevState);
  }, []);

  const [tokenAddress, setTokenAddress] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenAddress = params.get("tokenAddress") || "";
    if (params.get("withdraw") === "crypto" && tokenAddress.length) {
      setTokenAddress(tokenAddress);
      setIsOpenWithdrawCryptoPopup(true);
    }
  }, [location.search]);

  const { width } = useWindowDimensions();
  const isMobile = width < PHONE_MAX_WIDTH;

  return (
    <div className="flex-1">
      <CustomDropdown>
        <ClickableDropdownArea>
          <DropdownFaceContent
            openedClassName={styles.dropdownWrapperActive}
            iconClassName={styles.dropdownIcon}
          >
            <Button
              className="w-full"
              disabled={!userAddress}
              variant="outline"
            >
              Withdraw
            </Button>
          </DropdownFaceContent>
        </ClickableDropdownArea>
        <DropdownBodyContent
          position="right"
          topMargin={20}
          customWidth={isMobile ? "calc(100vw - 64px)" : 334}
        >
          <div className={styles.dropdownBodyContent}>
            <div
              onClick={toggleOpenWithdrawSpotPopup}
              className={styles.dropdownBodyContentItem}
            >
              <SpotIcon />
              <Text weight="extraBold">Withdraw to Spot</Text>
            </div>
            <div
              onClick={toggleOpenWithdrawCryptoPopup}
              className={styles.dropdownBodyContentItem}
            >
              <CryproIcon />
              <Text weight="extraBold">Withdraw Crypto</Text>
            </div>
          </div>
        </DropdownBodyContent>
      </CustomDropdown>
      <WithdrawCryptoPopup
        setTokenAddress={(value: string) => {
          setTokenAddress(value);
        }}
        tokenAddress={tokenAddress}
        isOpen={isOpenWithdrawCryptoPopup}
        handleClose={toggleOpenWithdrawCryptoPopup}
      />
      <WithdrawSpotPopup
        setTokenAddress={(value: string) => {
          setTokenAddress(value);
        }}
        tokenAddress={tokenAddress}
        isOpen={isOpenWithdrawSpotPopup}
        handleClose={toggleOpenWithdrawSpotPopup}
      />
    </div>
  );
}
