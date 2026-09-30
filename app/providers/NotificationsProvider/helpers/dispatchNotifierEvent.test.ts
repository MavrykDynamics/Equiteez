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

it("renders closed order notifications with filled and claimable amounts", () => {
  const orderClosedFrame = {
    type: NotifierServerFrameType.Event,
    event_id: "0a8412d7-95c4-5b97-9140-0d0450562096",
    event_type: "ORDERBOOK_ORDER_UPDATED",
    kind: "order_closed",
    occurred_at: "2026-09-30T08:15:00.772489Z",
    channel: "wallet",
    payload: {
      status: "canceled",
      ended_at: "2026-09-30T08:15:00Z",
      order_id: "74",
      created_at: "2026-09-30T08:14:25Z",
      order_type: "market_buy",
      order_expiry: null,
      token_symbol: "OCEAN",
      token_address: "KT1PXS6bacaVGHHWCQtvNSvoGL9Daho3ozcp",
      operation_hash: "oo8TVNvX4tJf28QESLJDjo2vR9ZdjXTMuxFC44NZzDgQhYFA3ZH",
      token_decimals: 6,
      total_paid_out: "131288000",
      refunded_amount: "0",
      fulfilled_amount: "1990000",
      rwa_token_amount: "2000000",
      orderbook_address: "KT1DhyC3hPkX7PUQY5GNsVjqy6ArcCDYauP9",
      quote_token_symbol: "wUSDT",
      unfulfilled_amount: "10000",
      price_per_rwa_token: "999999999999",
      quote_token_address: "KT1Pn5Zpx1bJx5H51btk92pfwvUMCKtp2Q2v",
      quote_token_decimals: 6,
      total_usd_value_of_rwa_token_amount: "131800000",
    },
  } as const;

  expect(getNotificationMessage(orderClosedFrame)).toEqual({
    tone: "info",
    title: "Order closed, funds claimable",
    message:
      "Order closed, budget exhausted. 1.99 of 2 OCEAN filled. Rest funds claimable. Order #74.",
  });
});
