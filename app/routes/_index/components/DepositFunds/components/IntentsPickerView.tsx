import { useMemo } from "react";
import { BigNumber } from "bignumber.js";
import type { Address } from "viem";

import { RTokenIcon } from "~/lib/atoms/RTokenIcon";
import {
  RSelectList,
  type RSelectListSection,
} from "~/lib/organisms/RSelectList";
import type { IntentsDepositController } from "~/hooks/useIntentsDeposit";
import {
  getIntentChainIcon,
  getIntentTokenIcon,
} from "~/lib/intents/intentAssetIcon";
import type { IntentRouteOption } from "~/lib/intents/intentRoute";
import { useIntentSourceBalance } from "~/providers/EthereumProvider/hooks/useIntentSourceBalance";

import { DepositModalHeader } from "./DepositParts";
import {
  getIntentNetworkName,
  getIntentTokenReason,
  getIntentTokenTitle,
  getNetworkDefaultOption,
  groupIntentNetworks,
} from "./intentPickers";
import styles from "./IntentsPickerView.module.css";

export type IntentsPickerKind = "network" | "token";

type IntentsPickerViewProps = {
  kind: IntentsPickerKind;
  deposit: IntentsDepositController;
  /** e.g. "MetaMask 0x1234…abcd"; names the wallet the list applies to. */
  walletLabel: string;
  onDone: () => void;
  onClose: () => void;
};

export const formatTokenBalance = (balance: BigNumber) =>
  balance.decimalPlaces(4, BigNumber.ROUND_DOWN).toFormat();

/** Balance of one route's source token; per row, cached by React Query. */
function TokenBalance({
  option,
  owner,
}: {
  option: IntentRouteOption;
  owner: Address | null;
}) {
  const { balance, status } = useIntentSourceBalance(
    option.source,
    owner,
    option.availability === "available"
  );
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

/** Network or token picker; replaces the modal content as in the design. */
export function IntentsPickerView({
  kind,
  deposit,
  walletLabel,
  onDone,
  onClose,
}: IntentsPickerViewProps) {
  const { catalog, selected, sourceAddress, selectRoute } = deposit;
  const networks = useMemo(
    () => groupIntentNetworks(catalog.options),
    [catalog.options]
  );
  const selectedChainId = selected?.route.sourceChainId;

  const sections = useMemo<RSelectListSection[]>(() => {
    if (kind === "network") {
      const toItem = (network: (typeof networks)[number]) => ({
        id: network.chainId,
        icon: (
          <RTokenIcon
            label={network.name}
            size="large"
            src={getIntentChainIcon(network.chainId)}
          />
        ),
        title: network.name,
        subtitle: network.isAvailable
          ? network.symbols.join(", ")
          : network.unavailableReason,
        keywords: network.symbols,
        disabled: !network.isAvailable,
        isSelected: network.chainId === selectedChainId,
      });
      return [
        {
          id: "available",
          title: `Supported by your wallet · ${walletLabel}`,
          items: networks.filter((item) => item.isAvailable).map(toItem),
        },
        {
          id: "unavailable",
          title: "Not available",
          items: networks.filter((item) => !item.isAvailable).map(toItem),
        },
      ];
    }

    const options = catalog.options.filter(
      (option) => option.route.sourceChainId === selectedChainId
    );
    const toItem = (option: IntentRouteOption) => {
      const isAvailable = option.availability === "available";
      const title = getIntentTokenTitle(option);
      return {
        id: option.route.id,
        icon: (
          <RTokenIcon
            label={title}
            size="large"
            src={getIntentTokenIcon(option.source?.symbol)}
          />
        ),
        title,
        subtitle: isAvailable
          ? getIntentNetworkName(option)
          : getIntentTokenReason(option),
        value: isAvailable ? (
          <TokenBalance option={option} owner={sourceAddress} />
        ) : undefined,
        disabled: !isAvailable,
        isSelected: option.route.id === selected?.route.id,
      };
    };
    const networkName = selected ? getIntentNetworkName(selected) : "";
    return [
      {
        id: "available",
        title: `On ${networkName} · ${walletLabel}`,
        items: options
          .filter((option) => option.availability === "available")
          .map(toItem),
      },
      {
        id: "unavailable",
        title: "Not available for this deposit",
        items: options
          .filter((option) => option.availability !== "available")
          .map(toItem),
      },
    ];
  }, [
    catalog.options,
    kind,
    networks,
    selected,
    selectedChainId,
    sourceAddress,
    walletLabel,
  ]);

  const handleSelect = (id: string) => {
    if (kind === "network") {
      const network = networks.find((item) => item.chainId === id);
      const option = network && getNetworkDefaultOption(network);
      if (option && option.route.sourceChainId !== selectedChainId)
        selectRoute(option.route.id);
    } else if (id !== selected?.route.id) selectRoute(id);
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
