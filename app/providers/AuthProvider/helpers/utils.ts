import { dappClient } from "~/providers/WalletProvider/WalletCore.client";

const MICHELINE_PREFIX = "05";
const MICHELINE_STRING_TAG = "01";
const AUTH_SIGNATURE_FORMAT = "micheline_string";
const AUTH_WALLET_PROVIDER = "mavryk_extension";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toPaddedHex(value: number, length: number) {
  return value.toString(16).padStart(length, "0");
}

export function utf8ToHex(message: string) {
  return bytesToHex(new TextEncoder().encode(message));
}

export function buildMichelineStringPayloadHex(message: string) {
  const messageHex = utf8ToHex(message);
  const lengthHex = toPaddedHex(messageHex.length / 2, 8);

  return `${MICHELINE_PREFIX}${MICHELINE_STRING_TAG}${lengthHex}${messageHex}`;
}

export function buildAuthPayloadHex(challengeText: string) {
  return buildMichelineStringPayloadHex(utf8ToHex(challengeText));
}

export async function signAuthChallenge(challenge: string) {
  const wallet = dappClient().loadWallet();
  const acc = await wallet.client.getActiveAccount();

  if (!acc?.address || !acc.publicKey) {
    throw new Error("No active account");
  }

  const payload = buildAuthPayloadHex(challenge);
 
  const result = await wallet.client.requestSignPayload({
    payload,
    sourceAddress: acc.address,
    signingType: "micheline",
  });

  return {
    publicKey: acc.publicKey,
    signature: result.signature,
    format: AUTH_SIGNATURE_FORMAT,
    walletProvider: AUTH_WALLET_PROVIDER,
  };
}
