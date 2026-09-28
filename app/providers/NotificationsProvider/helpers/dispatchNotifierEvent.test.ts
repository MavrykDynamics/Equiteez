import { expect, it, vi } from "vitest";
import { dispatchNotifierEvent } from "./dispatchNotifierEvent";
import { getNotificationMessage } from "./messages/notifications.messages";
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

it("preserves event kind so wallet notification frames can render toasts", () => {
  const orderFilledFrame = {
    type: NotifierServerFrameType.Event,
    event_id: "7b13ceef-169e-54d8-805f-c365fcd26a97",
    event_type: "ORDERBOOK_ORDER_UPDATED",
    kind: "order_filled",
    occurred_at: "2026-09-28T09:02:10.787808Z",
    channel: "wallet",
    payload: {
      fulfilled_amount: "3000000",
      order_id: "6427",
      order_type: "market_sell",
      price_per_rwa_token: "0",
      quote_token_decimals: 6,
      quote_token_symbol: "USDt",
      rwa_token_amount: "3000000",
      token_decimals: 6,
      token_symbol: "MARS1",
      total_paid_out: "60107000",
    },
  } as const;

  const parsedFrame = parseNotifierServerFrame(
    JSON.stringify(orderFilledFrame)
  );

  expect(parsedFrame).toEqual(orderFilledFrame);
  expect(parsedFrame && getNotificationMessage(parsedFrame)).toEqual({
    tone: "success",
    title: "Market Sell Order fully filled",
    message:
      "Sold 3 MARS1 at avg. USDt 20.035667. Total 60.107 USDt. Settled onchain. Order #6427.",
  });
});
