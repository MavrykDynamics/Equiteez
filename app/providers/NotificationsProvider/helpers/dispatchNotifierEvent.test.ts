import { expect, it, vi } from "vitest";
import { dispatchNotifierEvent } from "./dispatchNotifierEvent";
import { parseNotifierServerFrame } from "../hooks/useNotifierSocket/useNotifierSocket.helpers";
import { NotifierServerFrameType } from "../notifications.const";

const frame = {
  type: NotifierServerFrameType.Event,
  event_id: "event-1",
  event_type: "BRIDGE_DEPOSIT_UPDATED",
  occurred_at: "2026-09-23T12:00:00Z",
  channel: "wallet",
  payload: { status: "COMPLETED" },
} as const;
it("isolates synchronous and asynchronous listener errors without blocking other listeners", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const last = vi.fn();
  dispatchNotifierEvent(
    [
      () => {
        throw new Error("private payload");
      },
      async () => {
        throw new Error("private payload");
      },
      last,
    ],
    frame,
    "wallet-a"
  );
  await Promise.resolve();
  await Promise.resolve();
  expect(last).toHaveBeenCalledWith(frame, "wallet-a");
  expect(warn).toHaveBeenCalledTimes(2);
  expect(warn.mock.calls).toEqual([
    ["Notifier listener failed"],
    ["Notifier listener failed"],
  ]);
  warn.mockRestore();
});
it("validates envelope fields while keeping bridge payloads opaque", () => {
  expect(parseNotifierServerFrame(JSON.stringify(frame))).toEqual(frame);
  for (const invalid of [
    { payload: [] },
    { payload: null },
    { event_id: "" },
    { occurred_at: "bad-date" },
    { channel: 123 },
  ])
    expect(
      parseNotifierServerFrame(JSON.stringify({ ...frame, ...invalid }))
    ).toBeNull();
  expect(parseNotifierServerFrame("not JSON")).toBeNull();
  expect(parseNotifierServerFrame({})).toBeNull();
  expect(
    parseNotifierServerFrame(
      JSON.stringify({ type: "subscribed", channels: [123] })
    )
  ).toBeNull();
});
