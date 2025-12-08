import styles from "~/routes/wallet.info/styles.module.css";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import { Button } from "~/lib/atoms/Button";
import { ExportKeyPopup } from "~/routes/wallet.info/components/ExportKeyPopup";
import { BackupPopup } from "~/routes/wallet.info/components/BackupPopup";
import classNames from "clsx";
import { QrCode } from "~/routes/wallet/components/Deposit/QrCode";
import { CopyButton } from "~/lib/atoms/CopyButton";
import { Icon } from "~/lib/atoms/Icon";
import { RoundedCard } from "~/lib/atoms/RoundedCard/RoundedCard";
import React, { useCallback, useState } from "react";
import { useUserContext } from "~/providers/UserProvider/user.provider";

export function WalletInformation() {
  const { userAddress } = useUserContext();

  const [isExportKeyPopupOpen, setIsExportKeyPopupOpen] = useState(false);
  const [isBackupPopupOpen, setBackupPopupOpen] = useState(false);

  const toggleOpenExportKeyPopup = useCallback(
    () => setIsExportKeyPopupOpen((prevState) => !prevState),
    []
  );
  const toggleOpenBackupPopup = useCallback(
    () => setBackupPopupOpen((prevState) => !prevState),
    []
  );

  return (
    <RoundedCard className={styles.roundedWrapper}>
      <Heading level="5">RWA Wallet Information</Heading>
      <div className={styles.walletInformationWrapper}>
        <div className={styles.walletInformationContainer}>
          <div className={styles.walletInformationContent}>
            <div className={styles.walletInformationText}>
              <Text weight="semibold">Export Key</Text>
              <Text
                size="smallBody"
                color="lightSand"
                className="max-w-[420px] block"
              >
                Securely export your private key to store or use it elsewhere.
                Only do this on trusted devices.
              </Text>
            </div>
            <Button
              onClick={toggleOpenExportKeyPopup}
              className={styles.walletBtn}
              variant="outline"
            >
              Export Key
            </Button>
            <ExportKeyPopup
              isOpen={isExportKeyPopupOpen}
              onClose={toggleOpenExportKeyPopup}
              onSubmit={async () => {}}
            />
          </div>

          <div className={styles.walletInformationContent}>
            <div className={styles.walletInformationText}>
              <Text weight="semibold">Manual Backup</Text>
              <Text
                size="smallBody"
                color="lightSand"
                className="max-w-[430px] block"
              >
                Create a manual backup of your wallet to keep your access safe.
                Keep it in a safe, offline location.
              </Text>
            </div>
            <Button
              onClick={toggleOpenBackupPopup}
              className={styles.walletBtn}
              variant="outline"
            >
              Backup
            </Button>
            <BackupPopup
              isOpen={isBackupPopupOpen}
              onClose={toggleOpenBackupPopup}
              onSubmit={async () => {}}
            />
          </div>
        </div>
        <div
          className={classNames(
            styles.walletInformationContainer,
            styles.walletQrContainer
          )}
        >
          <QrCode address={userAddress || ""} />
          <div className={styles.userAddressContainer}>
            <Text>Wallet Address</Text>

            <div className={styles.qrItem}>
              <Text size="smallBody" color="extraLightSand">
                {userAddress}
              </Text>
              <CopyButton text={userAddress || ""}>
                <Text>
                  <Icon icon="copy" />
                </Text>
              </CopyButton>
            </div>
          </div>
        </div>
      </div>
    </RoundedCard>
  );
}
