import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import {
  TransactionWidgetProvider,
  useTransactionWidget,
} from "./TransactionWidgetProvider";
import { BridgeTransactions, bridgeNetwork } from "./bridgeTransactions";
import { localRecord } from "./bridgeTransactions.fixtures";

const mocks = vi.hoisted(() => ({
  presentation: undefined as unknown,
  context: {} as Record<string, unknown>,
}));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useState: (initial: unknown) => {
    if (mocks.presentation === undefined) mocks.presentation = initial;
    return [
      mocks.presentation,
      (update: unknown) => {
        mocks.presentation =
          typeof update === "function" ? update(mocks.presentation) : update;
      },
    ];
  },
}));
vi.mock("./TransactionsProvider", () => ({
  useTransactionsContext: () => mocks.context,
}));
let store: BridgeTransactions;
function renderWidget(route = "/") {
  let widget!: ReturnType<typeof useTransactionWidget>;
  function Route() {
    widget = useTransactionWidget();
    return createElement("span", null, route);
  }
  renderToString(
    createElement(TransactionWidgetProvider, null, createElement(Route))
  );
  return widget;
}
beforeEach(() => {
  mocks.presentation = undefined;
  store = new BridgeTransactions("wallet-a", bridgeNetwork, () => ({
    getItem: () => null,
    setItem: () => {},
  }));
  store.update(localRecord());
  mocks.context = { ...store.getSnapshot(), session: store, refresh: vi.fn() };
});

it("dismissal and route changes preserve canonical tracking and errors remain exposed", () => {
  const widget = renderWidget();
  widget.dismiss("operation-1");
  widget.dismiss("operation-2");
  widget.setIsOpen(true);
  const nextRoute = renderWidget("/portfolio");
  expect(nextRoute.dismissed).toEqual(new Set(["operation-1", "operation-2"]));
  expect(nextRoute.isOpen).toBe(true);
  expect(nextRoute.transactions).toHaveLength(1);
  expect(store.getSnapshot().transactions.size).toBe(1);
  mocks.context = {
    ...mocks.context,
    storageError: "Storage unavailable",
    reconciliationError: "Status unavailable",
  };
  const unavailable = renderWidget();
  expect(unavailable.storageError).toBe("Storage unavailable");
  expect(unavailable.reconciliationError).toBe("Status unavailable");
});
it("presentation cannot leak across account/network sessions or logout and return", () => {
  renderWidget().dismiss("operation-1");
  mocks.context = { ...mocks.context, session: null, transactions: new Map() };
  expect(renderWidget().dismissed.size).toBe(0);
  mocks.context = {
    ...mocks.context,
    session: {},
    transactions: store.getSnapshot().transactions,
  };
  const returned = renderWidget();
  expect(returned.dismissed.size).toBe(0);
  expect(returned.isOpen).toBe(false);
  expect(returned.transactions).toHaveLength(1);
});
