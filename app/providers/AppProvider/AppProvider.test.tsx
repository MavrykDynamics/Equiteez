// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { AppProvider, useAppContext } from "./AppProvider";

let root: ReturnType<typeof createRoot>;
let value: ReturnType<typeof useAppContext>;
function Probe() { value = useAppContext(); return null; }
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });

it("marks the context as web after mounting in a browser", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(createElement(AppProvider, null, createElement(Probe))));
  expect(value.IS_WEB).toBe(true);
});
