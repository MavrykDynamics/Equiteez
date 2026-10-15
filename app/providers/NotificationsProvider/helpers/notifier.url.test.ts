import { expect, it } from "vitest";
import { resolveNotifierUrl } from "./notifier.url";
it("converts HTTP API origins into a clean notifier WebSocket URL", () => {
  expect(resolveNotifierUrl("https://api.example.com/v1?x=1#hash")).toBe("wss://api.example.com/ws");
  expect(resolveNotifierUrl("http://localhost:3000/api")).toBe("ws://localhost:3000/ws");
});
it("rejects absent, malformed and non-HTTP API URLs", () => {
  expect(resolveNotifierUrl()).toBeNull();
  expect(resolveNotifierUrl("not a url")).toBeNull();
  expect(resolveNotifierUrl("ftp://example.com")).toBeNull();
});
