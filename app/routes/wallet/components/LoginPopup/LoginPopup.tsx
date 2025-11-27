import React, { useCallback, useEffect } from "react";
import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
import LoginImg from "app/assets/wallet/login.png";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useNavigate } from "@remix-run/react";
import { ROUTES } from "~/consts/routes";

export function LoginPopup({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { connect, userAddress } = useUserContext();
  const navigate = useNavigate();

  const handleSubmitLogin = useCallback(async () => {
    await connect();
    if (userAddress) onClose();
  }, [connect, onClose, userAddress]);

  useEffect(() => {
    if (userAddress) onClose();
  }, [onClose, userAddress]);

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
          className="w-6 h-6 cursor-pointer relative text-white stroke-current"
          onClick={() => navigate(ROUTES.home)}
        />
      </button>
      <div className={styles.contentWrapper}>
        <div className="flex flex-col gap-[16px] items-center">
          <img src={LoginImg} alt="login" className="w-[176px]" />
          <div className="flex flex-col gap-[12px] items-center">
            <Heading level="4">Log in to your Account</Heading>
            <Text className="text-center">
              Already have an account? Log in.
              <br /> New here? Create one to start investing in real world
              <br /> assets with ease.
            </Text>
          </div>
        </div>

        <div className={styles.btnWrapper}>
          <ButtonV2
            onClick={onClose}
            className="flex-1"
            variant="yellowOutlined"
          >
            Create Account
          </ButtonV2>
          <ButtonV2
            onClick={handleSubmitLogin}
            className="flex-1"
            variant="yellowPrimary"
          >
            Login
          </ButtonV2>
        </div>
      </div>
    </CustomPopup>
  );
}
