import { dappClient } from "~/providers/WalletProvider/WalletCore.client";

const MICHELINE_PREFIX = "05";
const MICHELINE_STRING_TAG = "01";

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
  const messageHexBytesLength = messageHex.length / 2;
  const lengthHex = toPaddedHex(messageHexBytesLength, 8);

  return `${MICHELINE_PREFIX}${MICHELINE_STRING_TAG}${lengthHex}${messageHex}`;
}

export async function signAuthChallenge(challenge: string) {
  const wallet = dappClient().loadWallet();
  const acc = await wallet.client.getActiveAccount();

  if (!acc?.address || !acc.publicKey) {
    throw new Error("No active account");
  }

  const payload = buildMichelineStringPayloadHex(challenge);
  const result = await wallet.client.requestSignPayload({
    payload,
    sourceAddress: acc.address,
    signingType: "micheline",
  });

  return `${acc.publicKey}:${result.signature}`;
}
