// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TokensProvider, useTokensContext } from "./tokens.provider";

let root: ReturnType<typeof createRoot>;
let value: ReturnType<typeof useTokensContext>;
function Probe() { value = useTokensContext(); return null; }
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });

it("initializes supplied tokens and merges later updates without duplicates", async () => {
  await act(async () => root.render(createElement(TokensProvider, { initialTokens: [{ contract: "KT1", id: "1" }], initialTokensMetadata: {} }, createElement(Probe))));
  expect(value.isLoading).toBe(false);
  expect(value.tokens).toEqual(expect.arrayContaining([{ contract: "KT1", id: "1" }]));
  const initialCount = value.tokens.length;
  await act(async () => value.upsertTokensData([{ contract: "KT1", id: "1" }, { contract: "KT2", id: "2" }], {}));
  expect(value.tokens).toHaveLength(initialCount + 1);
  expect(value.tokens).toEqual(expect.arrayContaining([{ contract: "KT2", id: "2" }]));
});
