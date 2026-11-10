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
  const lengthHex = toPaddedHex(messageHex.length / 2, 8);

  return `${MICHELINE_PREFIX}${MICHELINE_STRING_TAG}${lengthHex}${messageHex}`;
}

export function buildAuthPayloadHex(challengeText: string) {
  return buildMichelineStringPayloadHex(utf8ToHex(challengeText));
}
