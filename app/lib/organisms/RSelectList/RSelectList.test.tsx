// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RSelectList, type RSelectListSection } from "./RSelectList";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const sections: RSelectListSection[] = [
  {
    id: "available",
    title: "Supported by your wallet",
    items: [
      { id: "eth", icon: null, title: "Ethereum", keywords: ["USDT"] },
      { id: "arb", icon: null, title: "Arbitrum", value: "$18.20" },
    ],
  },
  {
    id: "unavailable",
    title: "Not available",
    items: [{ id: "sol", icon: null, title: "Solana", disabled: true }],
  },
];

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const options = () =>
  [...container.querySelectorAll<HTMLButtonElement>('[role="option"]')].map(
    (option) => option.textContent
  );

const search = (value: string) =>
  act(() => {
    const input = container.querySelector("input")!;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

describe("RSelectList", () => {
  it("renders sections and selects enabled rows only", () => {
    const onSelect = vi.fn();
    act(() =>
      root.render(
        <RSelectList
          label="Networks"
          onSelect={onSelect}
          searchPlaceholder="Search network"
          sections={sections}
        />
      )
    );

    expect(container.textContent).toContain("Not available");
    expect(options()).toEqual(["Ethereum", "Arbitrum$18.20", "Solana"]);
    const [eth, , sol] = container.querySelectorAll<HTMLButtonElement>(
      '[role="option"]'
    );
    act(() => eth.click());
    act(() => sol.click());
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("eth");
  });

  it("filters by title and keywords and drops empty sections", () => {
    act(() =>
      root.render(
        <RSelectList
          label="Networks"
          onSelect={vi.fn()}
          searchPlaceholder="Search network"
          sections={sections}
        />
      )
    );

    search("usdt");
    expect(options()).toEqual(["Ethereum"]);
    expect(container.textContent).not.toContain("Not available");

    search("nothing");
    expect(options()).toEqual([]);
    expect(container.textContent).toContain("Nothing matches your search.");
  });
});
