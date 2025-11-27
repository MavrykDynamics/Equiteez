import React, { useCallback, useEffect, useState } from "react";
import styles from "../DepositWithdraw/styles.module.css";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
import { Text } from "~/lib/atoms/Typography/Text";
import CryproIcon from "~/icons/wallet/crypto.svg?react";
import SpotIcon from "~/icons/wallet/spot.svg?react";
import { DepositCryptoPopup } from "~/routes/wallet/components/Deposit/DepositCryptoPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useLocation } from "@remix-run/react";
import { DepositSpotPopup } from "~/routes/wallet/components/Deposit/DepositSpotPopup";
import {
  PHONE_MAX_WIDTH,
  useWindowDimensions,
} from "~/hooks/useWindowDimensions";

export function Deposit() {
  const { userAddress } = useUserContext();
  const location = useLocation();

  const [isOpenDepositCryptoPopup, setIsOpenDepositCryptoPopup] =
    useState(false);
  const [isOpenDepositSpotPopup, setIsOpenDepositSpotPopup] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");

  const toggleOpenDepositCryptoPopup = useCallback(() => {
    setIsOpenDepositCryptoPopup((prevState) => !prevState);
  }, []);
  const toggleOpenDepositSpotPopup = useCallback(() => {
    setIsOpenDepositSpotPopup((prevState) => !prevState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("deposit") === "crypto") {
      setIsOpenDepositCryptoPopup(true);
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
            <ButtonV2
              className="w-full"
              disabled={!userAddress}
              variant="yellowPrimary"
            >
              Deposit
            </ButtonV2>
          </DropdownFaceContent>
        </ClickableDropdownArea>
        <DropdownBodyContent
          position={isMobile ? "left" : "right"}
          topMargin={20}
          customWidth={isMobile ? 'calc(100vw - 64px)' : 334}
        >
          <div className={styles.dropdownBodyContent}>
            <div
              onClick={toggleOpenDepositSpotPopup}
              className={styles.dropdownBodyContentItem}
            >
              <SpotIcon />
              <Text weight="extraBold">Deposit from Spot</Text>
            </div>
            <div
              onClick={toggleOpenDepositCryptoPopup}
              className={styles.dropdownBodyContentItem}
            >
              <CryproIcon />
              <Text weight="extraBold">Deposit Crypto</Text>
            </div>
          </div>
        </DropdownBodyContent>
      </CustomDropdown>
      <DepositCryptoPopup
        depositAddress={userAddress || ""}
        isOpen={isOpenDepositCryptoPopup}
        handleClose={toggleOpenDepositCryptoPopup}
      />
      <DepositSpotPopup
        setTokenAddress={(value: string) => {
          setTokenAddress(value);
        }}
        tokenAddress={tokenAddress}
        isOpen={isOpenDepositSpotPopup}
        handleClose={toggleOpenDepositSpotPopup}
      />
    </div>
  );
}
