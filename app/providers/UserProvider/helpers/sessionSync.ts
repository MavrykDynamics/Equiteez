/**
 * Keeps the connected wallet and the RWA session consistent
 * (docs/dynamic-wallet.md §4–§5, DYN-FE-02/04).
 *
 * - A wallet without an RWA session is disconnected, so connecting again
 *   signs in.
 * - A wallet and an RWA session of different addresses: when only one of
 *   them changed while no sign-in runs here, another tab did it (tokens and
 *   Mavryk Wallet's active account are shared), e.g. it switched accounts.
 *   This tab lets its wallet go without touching the shared state and
 *   reloads to pick up the other tab's. Otherwise (found on load, or both
 *   changed at once) the RWA session is logged out.
 * - An RWA session without a wallet is logged out when this tab lost the
 *   wallet: the restore on load could not reopen it (e.g. the email wallet's
 *   session expired) or it went away (e.g. Dynamic signed out).
 * - A session that another tab signed in while this tab had no wallet is
 *   kept (tokens are shared: logging it out would end the other tab's
 *   sign-in) and this tab reloads to pick up the wallet: Dynamic and Beacon
 *   read their sessions from storage only when they start.
 * - Nothing happens while a wallet is connecting or a sign-in is running:
 *   the wallet appears before login() finishes, and that is not a mismatch.
 */
export type SessionSyncInput = {
  isWeb: boolean;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  /** connect → login (or account switch) in progress */
  isAuthFlowActive: boolean;
  /** The wallet provider is restoring or connecting */
  isWalletBusy: boolean;
  accountAddress: string | null;
  authenticatedWalletAddress: string | null;
  /**
   * This tab's state at the previous settled check; null before the first
   * one, i.e. right after the restore on load
   */
  previous: SessionSyncSnapshot | null;
};

export type SessionSyncSnapshot = Pick<
  SessionSyncInput,
  "accountAddress" | "authenticatedWalletAddress"
>;

export type SessionSyncAction =
  | "none"
  | "disconnect-wallet"
  | "logout-rwa"
  | "reload-tab"
  /** Disconnect locally, keeping shared state, then reload-tab */
  | "release-wallet";

/** False while a check would act on a state that is still changing. */
export function isSessionSyncSettled({
  isWeb,
  isAuthLoading,
  isAuthFlowActive,
  isWalletBusy,
}: Pick<
  SessionSyncInput,
  "isWeb" | "isAuthLoading" | "isAuthFlowActive" | "isWalletBusy"
>) {
  return isWeb && !isAuthLoading && !isAuthFlowActive && !isWalletBusy;
}

export function getSessionSyncAction({
  isWeb,
  isAuthLoading,
  isAuthenticated,
  isAuthFlowActive,
  isWalletBusy,
  accountAddress,
  authenticatedWalletAddress,
  previous,
}: SessionSyncInput): SessionSyncAction {
  if (
    !isSessionSyncSettled({
      isWeb,
      isAuthLoading,
      isAuthFlowActive,
      isWalletBusy,
    })
  ) {
    return "none";
  }

  if (!accountAddress) {
    if (!isAuthenticated) return "none";

    const hadWallet = previous ? Boolean(previous.accountAddress) : null;

    return hadWallet === false ? "reload-tab" : "logout-rwa";
  }
  if (!isAuthenticated) return "disconnect-wallet";

  if (
    authenticatedWalletAddress &&
    accountAddress !== authenticatedWalletAddress
  ) {
    const isChangedElsewhere =
      previous !== null &&
      (previous.accountAddress === accountAddress ||
        previous.authenticatedWalletAddress === authenticatedWalletAddress);

    return isChangedElsewhere ? "release-wallet" : "logout-rwa";
  }

  return "none";
}
