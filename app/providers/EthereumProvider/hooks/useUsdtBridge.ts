import { useCallback, useRef, useState } from "react";
import { BigNumber } from "bignumber.js";
import { BaseError, type Address } from "viem";
import { useConfig } from "wagmi";
import { getAccount } from "wagmi/actions";

import { USDT_BRIDGE } from "~/consts/usdtBridge";
import {
  BridgeConfirmationError,
  confirmUsdtBridgeTransaction,
  executeUsdtBridge,
  type UsdtBridgeProgress,
} from "~/contracts/usdtBridge.contract";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

export type UsdtBridgeState = {
  amount: string;
  recipient: string;
  sender: Address | null;
  progress?: UsdtBridgeProgress;
  isBusy: boolean;
  isConfirmationUnknown: boolean;
  error: string | null;
};

export function useUsdtBridge(refreshBalance: () => Promise<void>) {
  const config = useConfig();
  const { dapp } = useWalletContext();
  const [state, setState] = useState<UsdtBridgeState | null>(null);
  const stateRef = useRef<UsdtBridgeState | null>(null);

  const updateState = useCallback((next: UsdtBridgeState | null) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const run = useCallback(
    async (
      amount: BigNumber,
      recipient: string,
      pending?: UsdtBridgeProgress
    ) => {
      if (stateRef.current?.isBusy) return;
      const next: UsdtBridgeState = {
        amount: amount.toFixed(),
        recipient,
        sender: pending
          ? (stateRef.current?.sender ?? null)
          : (getAccount(config).address ?? null),
        progress: pending,
        isBusy: true,
        isConfirmationUnknown: false,
        error: null,
      };
      updateState(next);
      const onProgress = (progress: UsdtBridgeProgress) => {
        next.progress = progress;
        updateState({ ...next });
      };

      try {
        if (pending) {
          await confirmUsdtBridgeTransaction(config, pending, onProgress);
          if (pending.step === "lock") return;
        }

        const account = next.sender;
        if (!account) throw new Error("Connect your Ethereum wallet.");
        const assertWallets = async () => {
          const wallet = getAccount(config);
          if (
            !wallet.isConnected ||
            !wallet.connector ||
            wallet.address !== account
          )
            throw new Error(
              "Your Ethereum account changed. Reconnect and try again."
            );
          const [chainId, accounts, destinationAccount] = await Promise.all([
            wallet.connector.getChainId(),
            wallet.connector.getAccounts(),
            dapp?.getDAppClient().getActiveAccount(),
          ]);
          if (chainId !== USDT_BRIDGE.chainId)
            throw new Error("Switch your Ethereum wallet to Sepolia.");
          if (accounts[0]?.toLowerCase() !== account.toLowerCase())
            throw new Error(
              "Your Ethereum account changed. Reconnect and try again."
            );
          if (destinationAccount?.address !== recipient)
            throw new Error(
              "Your Mavryk account changed. Reconnect and try again."
            );
          if (
            destinationAccount.network.type !== USDT_BRIDGE.destinationNetwork
          )
            throw new Error("Connect your Mavryk wallet on Basenet.");
        };

        await executeUsdtBridge({
          config,
          account,
          amount,
          recipient,
          assertWallets,
          onProgress,
        });
      } catch (error) {
        next.isConfirmationUnknown = error instanceof BridgeConfirmationError;
        next.error =
          error instanceof BaseError
            ? error.shortMessage
            : error instanceof Error
              ? error.message
              : "Unable to submit the USDT bridge request.";
      } finally {
        next.isBusy = false;
        updateState({ ...next });
        void refreshBalance();
      }
    },
    [config, dapp, refreshBalance, updateState]
  );

  const submit = useCallback(
    async (amount: BigNumber, recipient: string) => {
      if (stateRef.current?.isConfirmationUnknown) return;
      await run(amount, recipient);
    },
    [run]
  );

  const checkConfirmation = useCallback(async () => {
    const current = stateRef.current;
    if (!current?.isConfirmationUnknown || !current.progress?.hash) return;
    await run(
      new BigNumber(current.amount),
      current.recipient,
      current.progress
    );
  }, [run]);

  const reset = useCallback(() => {
    if (!stateRef.current?.isBusy && !stateRef.current?.isConfirmationUnknown)
      updateState(null);
  }, [updateState]);

  return { state, submit, checkConfirmation, reset };
}
