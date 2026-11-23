import { BigNumber } from "bignumber.js";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { RAmountInput } from "./RAmountInput";

const render = (props: Partial<Parameters<typeof RAmountInput>[0]> = {}) =>
  renderToString(
    <RAmountInput
      amount={undefined}
      decimals={6}
      label="Amount to send"
      onChange={vi.fn()}
      token={null}
      {...props}
    />
  ).replace(/<!-- -->/g, "");

describe("RAmountInput", () => {
  it("shows the Select placeholder pill without a token", () => {
    const html = render({ onTokenClick: vi.fn() });
    expect(html).toContain("Amount to send");
    expect(html).toContain('aria-label="Select token"');
    expect(html).toContain(">Select<");
  });

  it("shows the selected token, amount and balance slot", () => {
    const html = render({
      amount: new BigNumber("25.5"),
      balance: "125.50",
      token: { symbol: "USDC", icon: null },
    });
    expect(html).toContain(">USDC<");
    expect(html).toContain('value="25.5"');
    expect(html).toContain("125.50");
    expect(html).not.toContain("<button");
  });

  it("disables every control when disabled", () => {
    const html = render({ disabled: true, onTokenClick: vi.fn() });
    expect(html).toContain('aria-disabled="true"');
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
});
