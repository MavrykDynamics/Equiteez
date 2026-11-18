import { describe, expect, it } from "vitest";

import {
  CONNECT_ERROR_MESSAGES,
  describeConnectError,
  isValidEmail,
  type ConnectStage,
} from "./connectWalletErrors";

const named = (name: string, text = name) =>
  Object.assign(new Error(text), { name });

describe("describeConnectError", () => {
  it("asks to pick a wallet when the account has several", () => {
    const wallets = [
      { walletId: "w1", address: "mv1A" },
      { walletId: "w2", address: "mv1B" },
    ];

    expect(
      describeConnectError(
        Object.assign(named("MultipleDynamicWalletsError"), { wallets }),
        "connect"
      )
    ).toEqual({ kind: "select-wallet", wallets });
  });

  it.each<[unknown, ConnectStage, string]>([
    [named("DynamicInitError"), "connect", CONNECT_ERROR_MESSAGES.unavailable],
    [
      named("DynamicNotConfiguredError"),
      "email",
      CONNECT_ERROR_MESSAGES.unavailable,
    ],
    [named("WrongNetworkError"), "connect", CONNECT_ERROR_MESSAGES.network],
    [
      new Error("Too many requests"),
      "code",
      CONNECT_ERROR_MESSAGES.rateLimited,
    ],
    [new Error("HTTP 429"), "email", CONNECT_ERROR_MESSAGES.rateLimited],
    [named("AbortedBeaconError"), "connect", CONNECT_ERROR_MESSAGES.cancelled],
    [
      new Error("User rejected the request"),
      "connect",
      CONNECT_ERROR_MESSAGES.cancelled,
    ],
    [
      new Error("Invalid verification token"),
      "code",
      CONNECT_ERROR_MESSAGES.invalidCode,
    ],
    [new Error("Expired"), "code", CONNECT_ERROR_MESSAGES.invalidCode],
    [
      new Error("Invalid email format"),
      "email",
      CONNECT_ERROR_MESSAGES.invalidEmail,
    ],
    [
      named(
        "LocalSignatureVerificationError",
        "The wallet returned an invalid signature. Nothing was sent."
      ),
      "connect",
      "The wallet returned an invalid signature. Nothing was sent.",
    ],
    [{}, "connect", CONNECT_ERROR_MESSAGES.generic],
  ])("%s at %s → %s", (error, stage, expected) => {
    expect(describeConnectError(error, stage)).toEqual({
      kind: "message",
      message: expected,
    });
  });
});

describe("isValidEmail", () => {
  it.each([
    ["a@b.co", true],
    ["  name.surname@mail.example.com ", true],
    ["a@b", false],
    ["no-at.example.com", false],
    ["a b@c.de", false],
    ["", false],
  ])("%s → %s", (email, expected) => {
    expect(isValidEmail(email)).toBe(expected);
  });
});
