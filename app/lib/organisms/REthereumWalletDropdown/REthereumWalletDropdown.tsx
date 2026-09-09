import { useEffect } from "react";
import clsx from "clsx";

import { HashShortView } from "~/lib/atoms/HashShortView";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import { useEthereumContext } from "~/providers/EthereumProvider/ethereum.provider";

import styles from "./REthereumWalletDropdown.module.css";

export function REthereumWalletDropdown({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const {
    userAddress,
    isConnecting,
    isReconnecting,
    connect,
    signOut,
    walletSelection: { connectors, isOpen, onClose, onConnect },
  } = useEthereumContext();
  const isBusy = isConnecting || isReconnecting;
  const hasDiscoveredWallets = connectors.some(
    (connector) => connector.type === "injected" && connector.id !== "injected"
  );
  const visibleConnectors = connectors.filter(
    (connector) => connector.id !== "injected" || !hasDiscoveredWallets
  );

  useEffect(() => onClose, [onClose]);

  return (
    <RCustomDropdown
      className={styles.dropdown}
      isOpen={isOpen}
      onOpenChange={(isOpened) => (isOpened ? connect() : onClose())}
    >
      <RDropdownFaceContent
        aria-label={
          userAddress ? "Ethereum wallet options" : "Connect Ethereum wallet"
        }
        className={clsx(styles.trigger, triggerClassName)}
      >
        {userAddress ? (
          <span aria-hidden="true" className={styles.statusDot} />
        ) : null}
        <RText className={styles.address} size="body-s">
          {isBusy ? (
            "Connecting…"
          ) : userAddress ? (
            <HashShortView
              hash={userAddress}
              firstCharsCount={8}
              lastCharsCount={3}
              trimAfter={14}
            />
          ) : (
            "Connect Wallet"
          )}
        </RText>
      </RDropdownFaceContent>
      <RDropdownBodyContent
        align="right"
        aria-label="Ethereum wallets"
        aria-busy={isBusy}
        className={styles.menu}
      >
        {visibleConnectors.map((connector) => (
          <RDropdownBodyContentItem
            disabled={isBusy}
            key={connector.uid}
            onClick={() => onConnect(connector)}
          >
            <span className={styles.walletOption}>
              {connector.icon ? (
                <img
                  alt=""
                  className={styles.walletIcon}
                  src={connector.icon}
                />
              ) : (
                <RIcon name="web" size="small" />
              )}
              <span>
                {connector.id === "injected"
                  ? "Browser Wallet"
                  : connector.name}
              </span>
            </span>
          </RDropdownBodyContentItem>
        ))}
        {userAddress && (
          <RDropdownBodyContentItem disabled={isBusy} onClick={signOut}>
            Sign out
          </RDropdownBodyContentItem>
        )}
      </RDropdownBodyContent>
    </RCustomDropdown>
  );
}
