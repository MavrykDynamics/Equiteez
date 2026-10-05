import { BaseError, UserRejectedRequestError } from "viem";
import { ProviderNotFoundError } from "wagmi";

type EthereumAction = "connect" | "switchNetwork" | "disconnect";

export function getEthereumErrorMessage(
  error: unknown,
  action: EthereumAction
) {
  if (error instanceof ProviderNotFoundError) {
    return "No browser wallet was found. Install an Ethereum wallet or choose WalletConnect.";
  }

  const isRejected =
    error instanceof UserRejectedRequestError ||
    (error instanceof BaseError &&
      error.walk(
        (cause) => cause instanceof UserRejectedRequestError
      ) instanceof UserRejectedRequestError);

  if (action === "switchNetwork") {
    return isRejected
      ? "Network switch was declined. Switch to Sepolia to continue."
      : "Unable to switch networks. Select Sepolia in your wallet and try again.";
  }

  if (action === "disconnect")
    return "Unable to disconnect the Ethereum wallet. Please try again.";

  return isRejected
    ? "Connection request was declined. Choose a wallet to try again."
    : "Unable to connect the Ethereum wallet. Check your wallet and try again.";
}
