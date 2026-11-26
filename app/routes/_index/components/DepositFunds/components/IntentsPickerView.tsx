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
  getIntentNetworkIcon,
  getIntentTokenIcon,
} from "~/lib/intents/intentAssetIcon";
import type { IntentSourceOption } from "~/lib/intents/intentCatalog";
import { useIntentSourceBalance } from "~/providers/EthereumProvider/hooks/useIntentSourceBalance";

import { DepositModalHeader } from "./DepositParts";
import {
  getIntentTokenSubtitle,
  getIntentTokenTitle,
  groupIntentNetworks,
  type IntentNetworkGroup,
} from "./intentPickers";
import styles from "./IntentsPickerView.module.css";

export type IntentsPickerKind = "network" | "token";

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
  owner: Address | null;
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

/** Network or token picker; replaces the modal content as in the design. */
export function IntentsPickerView({
  kind,
  deposit,
  onDone,
  onClose,
}: IntentsPickerViewProps) {
  const { catalog, selected, walletAddress, selectAsset } = deposit;
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
          title: "Other networks · send from any wallet or exchange",
          items: groups
            .filter((group) => group.network.family !== "evm")
            .map(toItem),
        },
      ];
    }

    const options = catalog.options.filter(
      (option) => option.network.key === selectedNetwork
    );
    const owner = selected?.network.family === "evm" ? walletAddress : null;
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
            value:
              owner && option.evmToken ? (
                <TokenBalance option={option} owner={owner} />
              ) : undefined,
            isSelected: option.assetId === selected?.assetId,
          };
        }),
      },
    ];
  }, [catalog.options, groups, kind, selected, selectedNetwork, walletAddress]);

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
