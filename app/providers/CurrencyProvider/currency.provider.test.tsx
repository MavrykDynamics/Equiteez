// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { CurrencyProvider, useCurrencyContext } from "./currency.provider";

let root: ReturnType<typeof createRoot>;
let value: ReturnType<typeof useCurrencyContext>;
function Probe() { value = useCurrencyContext(); return null; }
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });

it("exposes fiat and token conversion rates through context", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(createElement(CurrencyProvider, { fiatToTezos: { USD: 1.2 }, usdToToken: { USD: "0.5" } }, createElement(Probe))));
  expect(value).toEqual({ fiatToTezosRates: { USD: 1.2 }, usdToTokenRates: { USD: "0.5" } });
});
