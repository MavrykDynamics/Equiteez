import { useEffect, useMemo } from "react";
import { BigNumber } from "bignumber.js";

import { RTokenIcon } from "~/lib/atoms/RTokenIcon";
import {
  RSelectList,
  type RSelectListSection,
} from "~/lib/organisms/RSelectList";
import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import {
  getIntentNetworkIcon,
  getIntentTokenIcon,
} from "~/lib/intents/intentAssetIcon";
import type { IntentSourceOption } from "~/lib/intents/intentCatalog";
import { useIntentSourceBalance } from "~/providers/EthereumProvider/hooks/useIntentSourceBalance";
import { useIntentWalletsContext } from "~/providers/IntentWalletsProvider/IntentWalletsProvider";
import { RAlert } from "~/templates/Alert/RAlert";

import { DepositModalHeader } from "./DepositParts";
import {
  getIntentTokenSubtitle,
  getIntentTokenTitle,
  groupIntentNetworks,
  type IntentNetworkGroup,
} from "./intentPickers";
import styles from "./IntentsPickerView.module.css";

export type IntentsPickerKind = "network" | "token" | "wallet";

type IntentsPickerViewProps = {
  kind: IntentsPickerKind;
  deposit: IntentsDepositController;
  onDone: () => void;
  onClose: () => void;
};

export const formatTokenBalance = (balance: BigNumber) =>
  balance.decimalPlaces(4, BigNumber.ROUND_DOWN).toFormat();

/** Balance in the connected EVM wallet; per row, cached by React Query. */
function TokenBalance({
  option,
  owner,
}: {
  option: IntentSourceOption;
  owner: string | null;
}) {
  const { balance, status } = useIntentSourceBalance(option, owner);
  return (
    <>
      {status === "ready" && balance
        ? formatTokenBalance(balance)
        : status === "loading"
          ? "…"
          : "—"}
    </>
  );
}

/**
 * Wallets of the selected non-EVM network. Installed ones connect; others
 * open their install page. Connecting is optional: the deposit address can
 * be paid from any wallet.
 */
function IntentsWalletPicker({
  deposit,
  onDone,
  onClose,
}: Omit<IntentsPickerViewProps, "kind">) {
  const wallets = useIntentWalletsContext();
  const network = deposit.network;
  const family =
    network && network.family !== "evm" && wallets.isSupported(network.family)
      ? network.family
      : null;
  const state = family ? wallets.getFamily(family) : null;
  const load = wallets.load;
  useEffect(() => {
    if (family) load(family);
  }, [family, load]);
  const options = state?.wallets ?? [];
  const sections: RSelectListSection[] = [
    {
      id: "installed",
      title: "Detected in this browser",
      items: options
        .filter((wallet) => wallet.isInstalled)
        .map((wallet) => ({
          id: wallet.id,
          icon: (
            <RTokenIcon label={wallet.name} size="large" src={wallet.icon} />
          ),
          title: wallet.name,
          subtitle:
            wallets.connecting === `${family}:${wallet.id}`
              ? "Confirm in your wallet…"
              : "Connect",
          disabled: Boolean(wallets.connecting),
        })),
    },
    {
      id: "install",
      title: "Not installed",
      items: options
        .filter((wallet) => !wallet.isInstalled && wallet.installUrl)
        .map((wallet) => ({
          id: wallet.id,
          icon: (
            <RTokenIcon label={wallet.name} size="large" src={wallet.icon} />
          ),
          title: wallet.name,
          subtitle: "Get it, then reload this page",
        })),
    },
  ];

  const handleSelect = async (id: string) => {
    const wallet = options.find((item) => item.id === id);
    if (!family || !wallet) return;
    if (!wallet.isInstalled) {
      if (wallet.installUrl)
        window.open(wallet.installUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (await wallets.connect(family, wallet.id)) onDone();
  };

  return (
    <div className={styles.screen}>
      <DepositModalHeader
        onBack={onDone}
        onClose={onClose}
        title={
          network ? `Connect a ${network.name} wallet` : "Connect a wallet"
        }
      />
      <RSelectList
        emptyText={
          state?.status === "loading" || state?.status === "idle"
            ? "Looking for wallets…"
            : (state?.error ??
              `No ${network?.name ?? ""} wallet found. You can still pay from any wallet or exchange.`)
        }
        label="Wallets"
        onSelect={(id) => void handleSelect(id)}
        searchPlaceholder="Search wallet"
        sections={sections}
      />
      {wallets.connectError && (
        <RAlert header="Wallet not connected" role="alert" type="error">
          {wallets.connectError}
        </RAlert>
      )}
    </div>
  );
}

/** Network, token or wallet picker; replaces the modal content as in the design. */
export function IntentsPickerView(props: IntentsPickerViewProps) {
  return props.kind === "wallet" ? (
    <IntentsWalletPicker {...props} />
  ) : (
    <IntentsAssetPicker {...props} />
  );
}

function IntentsAssetPicker({
  kind,
  deposit,
  onDone,
  onClose,
}: IntentsPickerViewProps) {
  const { catalog, selected, sourceWallet, selectAsset } = deposit;
  const groups = useMemo(
    () => groupIntentNetworks(catalog.options),
    [catalog.options]
  );
  const selectedNetwork = selected?.network.key;

  const sections = useMemo<RSelectListSection[]>(() => {
    if (kind === "network") {
      const toItem = ({ network, symbols }: IntentNetworkGroup) => ({
        id: network.key,
        icon: (
          <RTokenIcon
            label={network.name}
            size="large"
            src={getIntentNetworkIcon(network.key)}
          />
        ),
        title: network.name,
        subtitle: symbols.join(", "),
        keywords: [...symbols, network.key],
        isSelected: network.key === selectedNetwork,
      });
      return [
        {
          id: "evm",
          title: "EVM networks · send from a connected wallet or any wallet",
          items: groups
            .filter((group) => group.network.family === "evm")
            .map(toItem),
        },
        {
          id: "other",
          title: "Other networks · send from their wallet or any exchange",
          items: groups
            .filter((group) => group.network.family !== "evm")
            .map(toItem),
        },
      ];
    }

    const options = catalog.options.filter(
      (option) => option.network.key === selectedNetwork
    );
    // Balances of the wallet that sends on this network, when connected.
    const owner = sourceWallet ?? null;
    return [
      {
        id: "tokens",
        title: selected ? `On ${selected.network.name}` : undefined,
        items: options.map((option) => {
          const title = getIntentTokenTitle(option, options);
          return {
            id: option.assetId,
            icon: (
              <RTokenIcon
                label={option.asset.symbol}
                size="large"
                src={getIntentTokenIcon(
                  option.asset.symbol,
                  option.asset.coingeckoId
                )}
              />
            ),
            title,
            subtitle: getIntentTokenSubtitle(option),
            keywords: [option.asset.symbol, option.asset.contractAddress ?? ""],
            value: owner ? (
              <TokenBalance option={option} owner={owner} />
            ) : undefined,
            isSelected: option.assetId === selected?.assetId,
          };
        }),
      },
    ];
  }, [catalog.options, groups, kind, selected, selectedNetwork, sourceWallet]);

  const handleSelect = (id: string) => {
    if (kind === "network") {
      const group = groups.find((item) => item.network.key === id);
      const option = group?.options[0];
      if (option && id !== selectedNetwork) selectAsset(option.assetId);
    } else if (id !== selected?.assetId) selectAsset(id);
    onDone();
  };

  return (
    <div className={styles.screen}>
      <DepositModalHeader
        onBack={onDone}
        onClose={onClose}
        title={kind === "network" ? "Select network" : "Select token"}
      />
      <RSelectList
        emptyText={
          kind === "network"
            ? "No network matches your search."
            : "No token matches your search."
        }
        label={kind === "network" ? "Networks" : "Tokens"}
        onSelect={handleSelect}
        searchPlaceholder={
          kind === "network" ? "Search network" : "Search token"
        }
        sections={sections}
      />
    </div>
  );
}
