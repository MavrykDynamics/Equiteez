import { describe, expect, it } from "vitest";

import { isPasskeyPromptDismissed } from "./dynamic.errors";

describe("isPasskeyPromptDismissed", () => {
  it("recognizes a closed or timed-out passkey prompt", () => {
    expect(
      isPasskeyPromptDismissed(
        Object.assign(new Error("The operation was not allowed"), {
          name: "NotAllowedError",
        })
      )
    ).toBe(true);
    expect(
      isPasskeyPromptDismissed(
        Object.assign(new Error("x"), { name: "AbortError" })
      )
    ).toBe(true);
  });

  it("leaves real failures alone", () => {
    expect(
      isPasskeyPromptDismissed(
        new Error("Passkey authenticator is not enabled")
      )
    ).toBe(false);
    expect(isPasskeyPromptDismissed("cancel")).toBe(false);
  });
});
