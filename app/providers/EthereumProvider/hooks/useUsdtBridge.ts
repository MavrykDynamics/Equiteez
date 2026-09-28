import { useCallback, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { useTransactionsContext } from "~/providers/TransactionsProvider/TransactionsProvider";
import {
  bridgeNetwork,
  withBridgeProgress,
  type BridgeTransaction,
} from "~/providers/TransactionsProvider/bridgeTransactions";
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
  const {
    account: trackingAccount,
    session,
    publish,
  } = useTransactionsContext();
  const scopeRef = useRef(session);
  scopeRef.current = session;
  const executionBusyRef = useRef(false);
  const recordRef = useRef<BridgeTransaction | null>(null);
  const { dapp } = useWalletContext();
  const [state, setState] = useState<UsdtBridgeState | null>(null);
  const stateRef = useRef<UsdtBridgeState | null>(null);
  const stateSessionRef = useRef(session);
  const runIdRef = useRef(0);

  const updateState = useCallback(
    (next: UsdtBridgeState | null) => {
      stateSessionRef.current = session;
      stateRef.current = next;
      setState(next);
    },
    [session]
  );

  const run = useCallback(
    async (
      amount: BigNumber,
      recipient: string,
      pending?: UsdtBridgeProgress
    ) => {
      if (
        executionBusyRef.current ||
        !trackingAccount ||
        trackingAccount !== recipient
      )
        return;
      executionBusyRef.current = true;
      const runId = ++runIdRef.current;
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
      let record: BridgeTransaction | null = pending ? recordRef.current : null;
      if (!record && next.sender) {
        record = {
          operationId: uuid(),
          account: recipient,
          network: bridgeNetwork,
          sender: next.sender,
          amount: amount.toFixed(),
          sourceToken: {
            address: USDT_BRIDGE.sourceToken.address,
            decimals: USDT_BRIDGE.sourceToken.decimals,
          },
          sequence: 0,
          sourceHashes: [],
          settlement: "unknown",
          verification: "local",
        };
      }
      recordRef.current = record;
      updateState(next);
      const onProgress = (progress: UsdtBridgeProgress) => {
        if (scopeRef.current !== session) return;
        next.progress = progress;
        if (record) {
          record = withBridgeProgress(record, progress);
          publish(record);
          if (runId === runIdRef.current) recordRef.current = record;
        }
        if (runId === runIdRef.current && scopeRef.current === session)
          updateState({ ...next });
      };

      try {
        if (pending) {
          await confirmUsdtBridgeTransaction(config, pending, onProgress);
          if (pending.step === "lock") return;
        }

        const account = next.sender;
        if (!account) throw new Error("Connect your Ethereum wallet.");
        const assertCurrentRun = () => {
          if (runId !== runIdRef.current || scopeRef.current !== session)
            throw new Error("The deposit flow was closed.");
        };
        const assertWallets = async () => {
          assertCurrentRun();
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
          assertCurrentRun();
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
        if (record) {
          record = {
            ...record,
            sequence: record.sequence + 1,
            verification: "unknown",
            executionError: next.error,
          };
          publish(record);
        }
      } finally {
        executionBusyRef.current = false;
        next.isBusy = false;
        if (runId === runIdRef.current && scopeRef.current === session)
          updateState({ ...next });
        if (scopeRef.current === session)
          void refreshBalance().catch(() =>
            console.warn("Ethereum balance refresh failed")
          );
      }
    },
    [
      config,
      dapp,
      refreshBalance,
      updateState,
      trackingAccount,
      session,
      publish,
    ]
  );

  const submit = useCallback(
    async (amount: BigNumber, recipient: string) => {
      if (
        stateSessionRef.current === session &&
        stateRef.current?.isConfirmationUnknown
      )
        return;
      await run(amount, recipient);
    },
    [run, session]
  );

  const checkConfirmation = useCallback(async () => {
    const current = stateRef.current;
    if (
      stateSessionRef.current !== session ||
      !current?.isConfirmationUnknown ||
      !current.progress?.hash
    )
      return;
    await run(
      new BigNumber(current.amount),
      current.recipient,
      current.progress
    );
  }, [run, session]);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    recordRef.current = null;
    updateState(null);
  }, [updateState]);

  return {
    state:
      stateSessionRef.current === session &&
      state?.recipient === trackingAccount
        ? state
        : null,
    submit,
    checkConfirmation,
    reset,
  };
}
