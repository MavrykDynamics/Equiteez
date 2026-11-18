import { describe, expect, it } from "vitest";

import { MavrykChainId } from "~/lib/mavryk/types";

import {
  ActionUnavailableError,
  assertActionAvailable,
  getActionAvailability,
  getCapabilityStatus,
  UNAVAILABLE_ACTION,
  UNAVAILABLE_FOR_EMAIL_WALLET,
  UNSUPPORTED_NETWORK,
  type CapabilityContext,
  type WalletAction,
} from "./capabilities";

const extension: CapabilityContext = {
  provider: "mavryk_extension",
  chainId: MavrykChainId.Basenet,
  isDynamicDirectEnabled: () => false,
};
const allEnabled = () => true;
const email: CapabilityContext = { ...extension, provider: "dynamic" };

const IMPLEMENTED: WalletAction[] = [
  "orderbook.buy",
  "orderbook.sell",
  "orderbook.cancel",
  "orderbook.refund",
  "primary.purchase",
  "withdraw",
  "bridge.deposit",
];
const NOT_IMPLEMENTED: WalletAction[] = ["bridge.withdraw", "dodo"];

describe("capabilities", () => {
  it.each(IMPLEMENTED)("Mavryk Wallet keeps %s as before", (action) => {
    expect(getActionAvailability(action, extension)).toEqual({
      isAllowed: true,
    });
  });

  it.each(IMPLEMENTED)(
    "email wallets need the rollout flag for %s",
    (action) => {
      expect(getCapabilityStatus("dynamic", action)).toBe("gated");
      expect(getActionAvailability(action, email)).toEqual({
        isAllowed: false,
        reason: UNAVAILABLE_FOR_EMAIL_WALLET,
      });
      expect(
        getActionAvailability(action, {
          ...email,
          isDynamicDirectEnabled: allEnabled,
        })
      ).toEqual({ isAllowed: true });
    }
  );

  it.each(NOT_IMPLEMENTED)(
    "%s stays unavailable for every wallet, flag or not",
    (action) => {
      expect(getActionAvailability(action, extension)).toEqual({
        isAllowed: false,
        reason: UNAVAILABLE_ACTION,
      });
      expect(
        getActionAvailability(action, {
          ...email,
          isDynamicDirectEnabled: allEnabled,
        }).isAllowed
      ).toBe(false);
    }
  );

  it("never allows an action that is not in the registry", () => {
    expect(getCapabilityStatus("mavryk_extension", "orderbook.swap")).toBe(
      "unavailable"
    );
    expect(
      getActionAvailability("orderbook.swap", {
        ...email,
        isDynamicDirectEnabled: allEnabled,
      }).isAllowed
    ).toBe(false);
  });

  it("enables gated actions one by one", () => {
    const onlyBuy = {
      ...email,
      isDynamicDirectEnabled: (action: string) => action === "orderbook.buy",
    };

    expect(getActionAvailability("orderbook.buy", onlyBuy).isAllowed).toBe(
      true
    );
    expect(getActionAvailability("withdraw", onlyBuy).isAllowed).toBe(false);
  });

  it("allows nothing on an unsupported network", () => {
    expect(
      getActionAvailability("orderbook.buy", {
        ...extension,
        chainId: MavrykChainId.Mainnet,
      })
    ).toEqual({ isAllowed: false, reason: UNSUPPORTED_NETWORK });
  });

  it("has no Gasless actions yet", () => {
    expect(
      getActionAvailability("orderbook.buy", { ...extension, mode: "gasless" })
        .isAllowed
    ).toBe(false);
  });

  it("throws a typed error for a blocked action", () => {
    expect(() => assertActionAvailable("withdraw", email)).toThrow(
      ActionUnavailableError
    );
    expect(() => assertActionAvailable("withdraw", extension)).not.toThrow();
  });
});
