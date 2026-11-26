import { describe, expect, it } from "vitest";

import {
  classifyIntentWalletError,
  IntentWalletError,
  isIntentWalletFamilySupported,
  loadIntentWalletAdapter,
} from ".";

describe("classifyIntentWalletError", () => {
  it("only treats explicit rejections as safe to retry", () => {
    expect(classifyIntentWalletError({ code: 4001, message: "no" })).toBe(
      "rejected"
    );
    expect(
      classifyIntentWalletError(new Error("User rejected the request"))
    ).toBe("rejected");
    expect(classifyIntentWalletError(new Error("Request cancelled"))).toBe(
      "rejected"
    );
    expect(
      classifyIntentWalletError(new IntentWalletError("not_sent", "RPC down"))
    ).toBe("not_sent");
    // Anything else may have been broadcast.
    expect(classifyIntentWalletError(new Error("timeout"))).toBe("unknown");
    expect(classifyIntentWalletError(undefined)).toBe("unknown");
  });
});

describe("loadIntentWalletAdapter", () => {
  it("never supports EVM, which goes through wagmi", async () => {
    expect(isIntentWalletFamilySupported("evm")).toBe(false);
    await expect(loadIntentWalletAdapter("evm" as never)).rejects.toThrow(
      /not supported/
    );
  });
});
