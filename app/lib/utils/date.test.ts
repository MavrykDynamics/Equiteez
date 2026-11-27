import { describe, expect, it } from "vitest";

import { formatDayMonthYear } from "./date";

describe("formatDayMonthYear", () => {
  it("shows a calendar day as '2 Nov 2026'", () => {
    expect(formatDayMonthYear(new Date(2026, 10, 2, 15, 30))).toBe(
      "2 Nov 2026"
    );
  });
});
