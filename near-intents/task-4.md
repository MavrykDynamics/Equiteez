Frontend code specification · Planning estimate: 3 working days. UI: Equiteez UI. Target repository: https://github.com/MavrykDynamics/Equiteez.

## Objective

Track the 1Click operation across modal dismissal and application navigation without confusing it with a direct bridge transaction.

## Implementation scope

- Target repository: https://github.com/MavrykDynamics/Equiteez. Implement/design the Equiteez application; standalone Bridge UI delivery is tracked separately.
- Add a typed 1Click operation model/adapter within the existing TransactionsProvider / TransactionWidgetProvider architecture. Preserve existing direct-bridge records and recovery behavior.
- Represent swap/delivery/forwarding stages from the shared backend, followed by bridge processing. Wire the Deposit Funds details view and RTransactionWidgetHost to the same canonical operation.
- Keep operation ID, source deposit hash, 1Click delivery hash and bridge forward hash/log index distinct. If joining existing settlement events, use verified forward-event identity; never pass the 1Click funding hash as a direct bridge lock hash.
- Persist account/environment-scoped recovery; implement minimize/reopen, route navigation, reload, disconnect and stale-session cancellation without duplicate widgets or source submissions.
- Reuse the existing NotificationsProvider as the socket owner. Do not add a second socket or a new backend mint-polling service; the new backend remains authoritative only through EVM WRAPPED.

## Acceptance criteria

- Closing/minimizing the modal continues one operation in the global widget; reopening details shows the same progress.
- Reload, duplicate events, out-of-order responses and account switching do not merge unrelated operations or expose another account’s state.
- 1Click SUCCESS, EVM WRAPPED and a single signer COMPLETED event cannot be presented as confirmed Mavryk receipt.
- Existing direct-deposit widgets, persistence and dismissal behavior pass regression coverage.

## Dependencies and handoff

Depends on / coordinate with: EQ-FE-03, BE-04, BE-05, BE-06, EQ-D-03.
