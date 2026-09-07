import type { Connector } from "wagmi";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { HashShortView } from "~/lib/atoms/HashShortView";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import styles from "./REthereumWalletModal.module.css";

type REthereumWalletModalProps = {
  connectors: readonly Connector[];
  error: string | null;
  isBusy: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connector: Connector) => Promise<void>;
  onDisconnect: () => Promise<void>;
  userAddress: string | null;
};

export function REthereumWalletModal({
  connectors,
  error,
  isBusy,
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
  userAddress,
}: REthereumWalletModalProps) {
  const hasDiscoveredWallets = connectors.some(
    (connector) => connector.type === "injected" && connector.id !== "injected"
  );
  const visibleConnectors = connectors.filter(
    (connector) => connector.id !== "injected" || !hasDiscoveredWallets
  );

  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Connect Ethereum wallet"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header}>
        <RHeading size="h6" weight="medium">
          Ethereum Wallet
        </RHeading>
        <button
          aria-label="Close wallet selection"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>
      <RText color="neutral-600" size="body-sm">
        Connect a wallet on Ethereum Sepolia.
      </RText>
      {userAddress && (
        <RText size="body-sm">
          Connected:{" "}
          <HashShortView
            hash={userAddress}
            firstCharsCount={8}
            lastCharsCount={4}
          />
        </RText>
      )}
      <div className={styles.wallets} aria-busy={isBusy}>
        {visibleConnectors.map((connector) => (
          <RButton
            disabled={isBusy}
            key={connector.uid}
            onClick={() => onConnect(connector)}
            size="medium"
            tone="black"
            variant="secondary"
          >
            {connector.id === "injected" ? "Browser Wallet" : connector.name}
          </RButton>
        ))}
      </div>
      {isBusy && (
        <RText role="status" size="body-s">
          Continue in your wallet…
        </RText>
      )}
      {error && (
        <RText color="red-500" role="alert" size="body-s">
          {error}
        </RText>
      )}
      {userAddress && (
        <RButton
          disabled={isBusy}
          onClick={onDisconnect}
          size="small"
          tone="black"
          variant="secondary"
        >
          Disconnect Wallet
        </RButton>
      )}
    </CustomPopup>
  );
}
