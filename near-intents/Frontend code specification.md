## Objective: deliver the feature in two independent applications

Implement the same sponsored 1Click transfer capability in two separately deployed UI repositories: /Users/johnvoronov/Spaces/mavryk-bridge-frontend and /Users/johnvoronov/Spaces/Equiteez. Each application must let users select a supported source asset, review a quote, fund a 1Click deposit and follow processing within that application. This is not an Equiteez link to the standalone bridge or a shared iframe.

Both clients use the same standalone backend, route catalog, operation API and sponsored forwarding logic described in Backend specification. Backend work is counted once. Existing FE-01–FE-06 now belong exclusively to Bridge UI; new EQ-FE-01–EQ-FE-06 belong exclusively to Equiteez UI. Both sets retain this existing Frontend code workstream.

## Shared API and lifecycle rules

- GET /routes, optional POST /quotes, POST /operations, optional POST /operations/:id/deposit and GET /operations/:id have the same versioned contract and error/state semantics for both UIs. Configure each approved origin/access adapter; do not assume that the Equiteez RWA session authorizes the new service.
- The backend resolves the predetermined forwarder per recipient/deployment and persists an executable operation before returning funding instructions. Neither UI adds a separate forwarder lookup step.
- The source wallet funds the 1Click source deposit address. Keep it distinct from the destination forwarder. A submitted source hash is a reconciliation hint; workers continue if the tab closes or the callback fails.
- Quotes expire and become invalid after material account/network/asset/amount/recipient changes. Use idempotency and reconcile uncertain broadcasts before prompting another payment.
- Show truthful progress through source funding, swap, delivery confirmation, sponsored forwarding and bridge processing. 1Click SUCCESS and EVM WRAPPED are not proof of receipt on Mavryk.
- The maintainer pays forwarding gas; users do not manually call the factory or pay/sign on Mavryk to receive tokens. No frontend maintainer key, generic gas/fee callout or default manual wrap action.
- The existing bridge signer/minter process delivers tokens asynchronously. Reuse each application’s own balance/data flow. No new backend mint-polling endpoint or mint-record request/response sequence.
- Use separate application/environment/account-scoped recovery state. Closing a modal, route navigation, logout or reload must not resend funds; cross-origin localStorage is not a recovery mechanism. Cross-device/client operation discovery is not newly promised without an authenticated backend contract.
- Only explicitly configured source funding adapters/routes are enabled at launch; additional non-EVM wallets remain separate scope. Share transport types/pure helpers if practical, but do not require a new cross-repository UI component package.

## UI 1 - standalone Bridge UI

Repository: /Users/johnvoronov/Spaces/mavryk-bridge-frontend. Entry surface: app/features/bridge/templates/BridgePage.tsx with the current bridge form/token components. Reuse MultiWalletProvider, wagmi, TokensProvider and app/providers/BalancesProvider/balances.provider.tsx. Preserve the existing direct bridge flow.

- Implement source selection, amount and Mavryk recipient confirmation, quote review, source-wallet funding and resumable operation progress in the standalone bridge layout.
- Support an entered recipient distinct from the connected Mavryk wallet. Do not require a recipient-side transaction; account connection is needed only for the balance context/features that depend on it.
- FE-05 now targets the standalone BalancesProvider, refreshBalances and Mavryk balance reads. It does not modify Equiteez. A different/disconnected recipient receives neutral processing/address/explorer information rather than a false connected-account receipt.
- FE-06 covers the standalone page, source wallet integration, balance refresh and existing direct bridge regression tests. Equiteez modal/widget behavior is tested in its own ticket set.

## UI 2 - Equiteez

Repository: /Users/johnvoronov/Spaces/Equiteez. Entry surface: app/routes/\_index/components/DepositFunds/RDepositFundsModal.tsx and its BridgeView/BridgeStatusView. Reuse UserProvider, EthereumProvider/wagmi, TransactionsProvider, TransactionWidgetProvider and RTransactionWidgetHost. These are existing integration points, not evidence that 1Click is already implemented.

- Retain the current Deposit Funds model: use the active Equiteez Mavryk account as the deposit recipient by default and display it clearly. Free-form other-recipient sending is already covered by standalone Bridge UI; a different Equiteez recipient flow should be an explicit product/design decision.
- Add the new route to the current deposit experience without removing the direct bridge and Receive options. Preserve current account authentication and source wallet selection behavior.
- Track the operation beyond modal visibility: submitted/details view, minimize/global widget, reopen, application navigation and reload must refer to one canonical operation.
- The current direct bridge record assumes a lock transaction. Add an explicit 1Click operation adapter/type: operation ID, source funding hash, delivery hash and forward hash/log identity are different. Never match a 1Click funding hash as if it emitted the bridge event.
- Reuse the current NotificationsProvider as the socket owner. Existing signer progress or hard-coded completion counts must not be copied as proof that this new route has minted. Use existing verified settlement/balance evidence where supported.
- Use UserProvider/userTokensBalances plus existing wallet/portfolio/activity invalidation for asynchronous receipt. Correlate a specific receipt only when the configured existing settlement contract provides a verified forward-event/recipient identity; otherwise keep neutral processing copy and let balances update.
- Scope persistence, late responses and notifications to the correct account/environment; prevent duplicate widgets/arrival toasts across reconnect. EQ-FE-06 includes regressions for the existing direct deposit and Receive flows.

## Acceptance and integration dependencies

- Each UI independently supports the full source-funding journey with the common backend. Shipping one UI does not complete the other UI’s implementation tickets.
- Both clients respect the same sponsored gas eligibility, per-destination concurrency and operation authorization; switching UI does not bypass server controls.
- Desktop/mobile behavior and accessibility match the UI-specific design handoffs in Frontend design specification.
- Final smoke tests run from each UI against the same configured environment, coordinated through BE-09. Verify the correct recipient balance, no duplicate source funding and truthful intermediate states.
- Launch dependencies: approved route/token mapping, two frontend origins/access adapters, funded maintainer wallet and route-compatible balance/settlement data. Existing Equiteez direct-bridge event schemas are not assumed to support every new route without verification.

## Delivery plan and estimates by UI

## Bridge UI - 6 tickets / 11.5 working person-days

- FE-01 - Build the source asset and Mavryk recipient form - 2 working days.
- FE-02 - Review quotes and create a recoverable payment operation - 2 working days.
- FE-03 - Fund the 1Click deposit with the source wallet - 2 working days.
- FE-04 - Show recoverable swap and forwarding progress - 2 working days.
- FE-05 - Refresh the standalone Mavryk balance after asynchronous receipt - 1.5 working days.
- FE-06 - Test the end-to-end interface and recovery states - 2 working days.

## Equiteez UI - 6 tickets / 13 working person-days

- EQ-FE-01 - Add 1Click entry and route selection to Deposit Funds - 2 working days.
- EQ-FE-02 - Review the quote and persist an Equiteez payment operation - 2 working days.
- EQ-FE-03 - Fund the 1Click deposit from the Equiteez source wallet - 2 working days.
- EQ-FE-04 - Integrate operation progress with the global transaction widget - 3 working days.
- EQ-FE-05 - Integrate asynchronous receipt with Equiteez balances and activity - 2 working days.
- EQ-FE-06 - Validate the Equiteez deposit flow and widget recovery - 2 working days.

Total for this workstream: 24.5 working person-days. Planning estimates include implementation/design and focused validation; exclude external waiting time and are not calendar commitments. Existing Bridge UI estimates are retained; Equiteez estimates account for its separate modal/widget/account integration. Backend is counted once in its own workstream.

All implementation/design tickets remain on Equiteez KANBAN in Dev To Do with an Estimation and this existing Workstream relation. Repository/UI scope is explicit in every ticket title and body.

## References and code anchors

Related scope: Backend specification · Frontend design specification

1Click API documentation · Equiteez KANBAN

Local references reviewed for this split: BridgePage.tsx, MultiWalletProvider and BalancesProvider in mavryk-bridge-frontend; RDepositFundsModal.tsx, UserProvider, EthereumProvider, TransactionsProvider/TransactionWidgetProvider and docs/bridge-tracking.md in Equiteez. Runtime contracts/configuration must still be validated for the selected 1Click route.
