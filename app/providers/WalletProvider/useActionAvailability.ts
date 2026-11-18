import { useMemo } from "react";

import {
  getActionAvailability,
  type ActionAvailability,
  type CapabilityContext,
  type WalletAction,
} from "./capabilities";
import { isDynamicDirectEnabled } from "./dynamic/dynamic.config";
import { useWalletContext } from "./wallet.provider";
import type { WalletIdentity } from "./wallet.types";

export const toCapabilityContext = (
  identity: Pick<WalletIdentity, "provider" | "chainId">
): CapabilityContext => ({
  provider: identity.provider,
  chainId: identity.chainId,
  isDynamicDirectEnabled,
});

/**
 * Whether the connected wallet may run `action`, for disabling controls. The
 * action handlers enforce the same rule. Without a wallet there is nothing to
 * restrict: those controls ask the user to connect.
 */
export function useActionAvailability(
  action: WalletAction
): ActionAvailability {
  const { identity } = useWalletContext();

  return useMemo(
    () =>
      identity
        ? getActionAvailability(action, toCapabilityContext(identity))
        : { isAllowed: true },
    [action, identity]
  );
}
