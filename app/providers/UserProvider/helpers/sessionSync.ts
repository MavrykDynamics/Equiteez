/**
 * Keeps the connected wallet and the RWA session consistent
 * (docs/dynamic-wallet.md §4–§5, DYN-FE-02/04).
 *
 * - A wallet without an RWA session is disconnected, so connecting again
 *   signs in.
 * - An RWA session of another address is logged out.
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
};

export type SessionSyncAction = "none" | "disconnect-wallet" | "logout-rwa";

export function getSessionSyncAction({
  isWeb,
  isAuthLoading,
  isAuthenticated,
  isAuthFlowActive,
  isWalletBusy,
  accountAddress,
  authenticatedWalletAddress,
}: SessionSyncInput): SessionSyncAction {
  if (!isWeb || isAuthLoading || isAuthFlowActive || isWalletBusy) {
    return "none";
  }

  if (!accountAddress) return "none";
  if (!isAuthenticated) return "disconnect-wallet";

  if (
    authenticatedWalletAddress &&
    accountAddress !== authenticatedWalletAddress
  ) {
    return "logout-rwa";
  }

  return "none";
}
