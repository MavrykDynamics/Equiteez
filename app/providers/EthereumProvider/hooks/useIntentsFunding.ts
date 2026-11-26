import { useCallback, useRef, useState } from "react";
import { useConfig } from "wagmi";

import {
  executeIntentFunding,
  executeIntentWalletFunding,
  IntentFundingBlockedError,
} from "~/contracts/intentsFunding.contract";
import { getIntentsApi } from "~/lib/apis/intents";
import { getIntentFundingErrorMessage } from "~/lib/intents/intentFunding";
import { useIntentWalletsContext } from "~/providers/IntentWalletsProvider/IntentWalletsProvider";
import type { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";

/**
 * Wallet funding of a persisted 1Click operation: the wagmi wallet for EVM
 * deposits, the connected Solana/NEAR/Aptos/Bitcoin wallet otherwise.
 * Separate from useUsdtBridge: no approve, no wrapToken, no Mavryk signature.
 */
export function useIntentsFunding() {
  const config = useConfig();
  const wallets = useIntentWalletsContext();
  const busyRef = useRef(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fund = useCallback(
    async (
      session: IntentOperations,
      localId: string,
      reviewedQuoteId: string,
      isCurrent: () => boolean
    ) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusyId(localId);
      setError(null);
      try {
        const record = session.get(localId);
        const params = {
          api: getIntentsApi(),
          session,
          localId,
          reviewedQuoteId,
          isCurrent,
        };
        const family = record?.source.family;
        if (!family || family === "evm")
          await executeIntentFunding({ ...params, config });
        else {
          if (!wallets.isSupported(family) || !record.sourceWalletId)
            throw new IntentFundingBlockedError(
              `Connect a ${record.source.networkName} wallet to send from it, or send to the deposit address from any wallet.`
            );
          await executeIntentWalletFunding({
            ...params,
            adapter: await wallets.getAdapter(family),
            walletId: record.sourceWalletId,
          });
        }
      } catch (failure) {
        // Late failures after an account change belong to the old session.
        if (isCurrent()) setError(getIntentFundingErrorMessage(failure));
      } finally {
        busyRef.current = false;
        setBusyId(null);
      }
    },
    [config, wallets]
  );
  const clearError = useCallback(() => setError(null), []);

  return { fund, busyId, error, clearError };
}
