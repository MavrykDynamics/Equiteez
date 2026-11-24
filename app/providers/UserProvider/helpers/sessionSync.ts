/**
 * Keeps the connected wallet and the RWA session consistent
 * (docs/dynamic-wallet.md §4–§5, DYN-FE-02/04).
 *
 * - A wallet without an RWA session is disconnected, so connecting again
 *   signs in.
 * - An RWA session of another address is logged out.
 * - An RWA session without a wallet is logged out when this tab lost the
 *   wallet: the restore on load could not reopen it (e.g. the email wallet's
 *   session expired) or it went away (e.g. Dynamic signed out).
 * - A session that another tab signed in while this tab had no wallet is
 *   kept: tokens are shared, so logging it out would end the other tab's
 *   sign-in.
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
   * Whether this tab had a wallet at the previous settled check; null before
   * the first one, i.e. right after the restore on load
   */
  hadWallet: boolean | null;
};

export type SessionSyncAction = "none" | "disconnect-wallet" | "logout-rwa";

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
  hadWallet,
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

    return hadWallet === false ? "none" : "logout-rwa";
  }
  if (!isAuthenticated) return "disconnect-wallet";

  if (
    authenticatedWalletAddress &&
    accountAddress !== authenticatedWalletAddress
  ) {
    return "logout-rwa";
  }

  return "none";
}
