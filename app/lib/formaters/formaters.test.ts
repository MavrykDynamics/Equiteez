import { describe, expect, it } from "vitest";

import { toFiatPrice } from "./formaters";

describe("toFiatPrice", () => {
  it("keeps 2 decimals from 0.01 up", () => {
    expect(toFiatPrice(1.234)).toBe("1.23");
    expect(toFiatPrice(0.01)).toBe("0.01");
    expect(toFiatPrice(1250.5)).toBe("1,250.50");
    expect(toFiatPrice(0)).toBe("0.00");
  });

  it("shows the first two significant digits under 0.01", () => {
    expect(toFiatPrice(0.0001323)).toBe("0.00013");
    expect(toFiatPrice(0.00999)).toBe("0.0099");
    expect(toFiatPrice(0.005)).toBe("0.005");
    expect(toFiatPrice(0.001)).toBe("0.001");
  });
});
