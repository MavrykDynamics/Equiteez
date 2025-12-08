import type { MetaFunction } from "@remix-run/node";
import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { WalletSidebar } from "./components/WalletSidebar/WalletSidebar";
import styles from "./route.module.css";
import { Outlet } from "@remix-run/react";
import { WalletTopBar } from "~/routes/wallet/components/WalletTopBar/WalletTopBar";
import React, { useCallback, useEffect, useState } from "react";
import { LoginPopup } from "~/routes/wallet/components/LoginPopup/LoginPopup";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { UserAssetsProvider } from "~/providers/UserAssets/userAssets.provider";

export const meta: MetaFunction = () => {
  return [
    { title: "Wallet" },
    { name: "description", content: "Wallet & Profile" },
  ];
};

export default function Wallet() {
  const { userAddress } = useUserContext();

  const [isOpenLoginPopup, setIsOpenLoginPopup] = useState(false);

  const toggleOpenLoginPopup = useCallback(
    () => setIsOpenLoginPopup((prevState) => !prevState),
    []
  );

  useEffect(() => {
    if (!userAddress) setIsOpenLoginPopup(true);
  }, [userAddress]);

  return (
    <PageLayout>
      <div className="mt-[24px] mb-[100px] max-w-[1240px] px-[40px] w-full m-auto relative">
        <div className={styles.container}>
          <WalletSidebar mbgBalance={0} />

          <UserAssetsProvider>
            <div className="flex flex-col gap-[16px] lg:gap-[24px]">
              <WalletTopBar />
              <Outlet />
            </div>
          </UserAssetsProvider>
        </div>
        <LoginPopup
          isOpen={isOpenLoginPopup}
          onClose={() => {
            setIsOpenLoginPopup(false);
          }}
        />
      </div>
    </PageLayout>
  );
}
