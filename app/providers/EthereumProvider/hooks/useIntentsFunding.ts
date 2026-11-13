import { useCallback, useRef, useState } from "react";
import { useConfig } from "wagmi";

import { executeIntentFunding } from "~/contracts/intentsFunding.contract";
import { getIntentsApi } from "~/lib/apis/intents";
import { getIntentFundingErrorMessage } from "~/lib/intents/intentFunding";
import type { IntentOperations } from "~/providers/TransactionsProvider/intentOperations";

/**
 * Source-wallet funding of a persisted 1Click operation. Separate from
 * useUsdtBridge: no approve, no wrapToken, no Mavryk signature.
 */
export function useIntentsFunding() {
  const config = useConfig();
  const busyRef = useRef(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fund = useCallback(
    async (
      session: IntentOperations,
      localId: string,
      isCurrent: () => boolean
    ) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusyId(localId);
      setError(null);
      try {
        await executeIntentFunding({
          config,
          api: getIntentsApi(),
          session,
          localId,
          isCurrent,
        });
      } catch (failure) {
        // Late failures after an account change belong to the old session.
        if (isCurrent()) setError(getIntentFundingErrorMessage(failure));
      } finally {
        busyRef.current = false;
        setBusyId(null);
      }
    },
    [config]
  );
  const clearError = useCallback(() => setError(null), []);

  return { fund, busyId, error, clearError };
}
