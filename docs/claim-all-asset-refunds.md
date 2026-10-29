# Claim all asset refunds — Equiteez App integration guide

> Source: `Claim all asset refunds - Equiteez App integration guide` (PDF, 15 pages; created October 22, 2026, last edited October 23, 2026), converted to Markdown.
> Related: [gasless-trading-integration-guide.md](./gasless-trading-integration-guide.md).

## 0. What the action does

“Claim all refunds” returns the wallet's available residual balances from closed orders for the selected RWA asset, including orders in historical orderbooks. Active orders keep running. An order whose wall-clock expiry has passed but whose on-chain state is still open is not claimable through this action.

The contracts already accept lists: `processRefund([{ orderId, orderType }, …])` directly, or one `permitProcessRefund` list inside one `permitAndExecute` permit. The App discovers the IDs and groups them into bounded parts. There is no new on-chain “find everything for this asset” entrypoint and no server-side bulk job.

| Surface           | Responsibility                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Refund read API   | Complete cursor traversal for one owner/asset; exact preliminary amounts; explicit blocked candidates                          |
| App               | Complete scan, review, per-book parts, payment choice, one signature at a time, durable progress and recovery                  |
| Contract          | Ownership, closed state, transfer restrictions and atomic execution of each call                                               |
| Relay/Gas Station | Validate one signed action, simulate, submit and expose its outcome; return eligible service fees on proven resource rejection |

One part is one orderbook call. Parts can contain BUY and SELL IDs together. The whole asset-wide run is not atomic: an earlier confirmed part remains successful if a later part fails. Never promise one signature for an unlimited number of orders.

BUY refunds return that order's quote token and can include unused escrow after a fully filled order received a better price. SELL refunds return RWA tokens; a deferred cancellation refund may already be net of its cancellation fee. Use the API's `amount_units` rather than deriving an amount from order size, price or `remaining_amount`, and do not subtract a cancellation fee again.

## 1. Endpoints and wire shapes

```
GET  /api/v1/wallets/{wallet}/refunds?token_address={RWA}&limit=100&cursor={cursor}
GET  /api/v1/relay/config
POST /api/v1/wallets/{wallet}/relay/operations
GET  /api/v1/wallets/{wallet}/relay/operations/{operationId}
GET  /api/v1/wallets/{wallet}/relay/operations?status=open&limit=100&cursor={cursor}
GET  /api/v1/wallets/{wallet}/relay/fee/credits
```

Use the existing authenticated wallet session for wallet routes. The refund endpoint is owner-only: no session is 401, another wallet's path is 403. `/relay/config` is public. The App calls the RWA Backend for Credits execution; it does not call Gas Station or hold its sponsor credentials.

### Refund page

The refund endpoint uses snake_case. Example with illustrative addresses, IDs and amounts (the placeholders are not executable contract addresses):

```json
{
  "as_of": {
    "orderbook": {
      "level": 123456,
      "timestamp": "2026-10-22T07:00:00Z",
      "realtime": true
    }
  },
  "items": [
    {
      "orderbook_address": "<ORDERBOOK>",
      "order_id": "12",
      "order_type": "BUY",
      "refund": {
        "token_address": "<QUOTE_TOKEN>",
        "token_id": "0",
        "amount_units": "1250000",
        "decimals": 6,
        "symbol": "USDT"
      },
      "availability": "eligible",
      "blocked_reason": null
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

| Field                                                | App handling                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `token_address` query                                | The RWA contract being viewed, whose RWA token ID is 0 in this model; not the quote token returned by a BUY refund |
| `limit`                                              | 1–200, default 100; limits raw rows examined before zero balances are removed                                      |
| `orderbook_address` + `order_type` + `order_id`      | Full candidate identity; BUY 12 and SELL 12 are different orders, and IDs can repeat across books                  |
| `order_id`, `refund.token_id`, `refund.amount_units` | Decimal strings; retain strings for transport and use BigInt/exact arithmetic for comparisons and sums             |
| `refund`                                             | May be `null` for a blocked candidate whose amount/identity cannot be established                                  |
| `refund.decimals`                                    | May be `null`; do not guess a scale from the symbol or another token                                               |
| `availability`                                       | `eligible` or `blocked`; eligible is preliminary, not a guarantee that a token transfer will succeed               |
| `blocked_reason`                                     | One current reason or `null`; not a list of every possible failure                                                 |
| `as_of.orderbook`                                    | Marker for this page, not a single frozen snapshot shared by the entire scan                                       |
| `has_more`, `next_cursor`                            | Continue until `has_more=false`, including when `items=[]`                                                         |

The endpoint is uncached (`Cache-Control: no-store`); `fresh=1` is unnecessary. It includes historical orderbooks outside the current trading allowlist. It has no 1,200-row history window, no total count and no server-computed grand total.

### Blocked candidates

| `blocked_reason`         | Render / action                                                            |
| ------------------------ | -------------------------------------------------------------------------- |
| `incomplete_order_data`  | Amount cannot be established; show unavailable and offer refresh           |
| `missing_token_identity` | Refund token cannot be resolved; exclude from payable totals               |
| `missing_token_metadata` | Token scale/symbol unavailable; show unavailable, without guessing         |
| `pause_status_unknown`   | Contract pause state could not be established; retry later                 |
| `process_refund_paused`  | Refunds are paused on this orderbook; explain and leave this candidate out |
| `indexer_not_realtime`   | Read-only stale data; wait and rescan before signing                       |

Keep blocked orders visible separately from executable totals. An all-blocked result is not “no refunds”. Tolerate future reason codes with a generic unavailable state. If any page is non-realtime, keep the prepared run read-only and restart preparation once the indexer catches up.

## 2. Prepare and review the whole run

1. Capture `{wallet, chainId, asset}`. Cancel preparation if any changes. Verify the wallet's active network as well as the application's RPC chain before signing/sending.
2. Request the first page without a cursor. Follow the returned cursor exactly, with the same wallet/asset/network. Do not decode it, synthesize it, or use the orders/history feed as a substitute.
3. Finish all pages before enabling confirmation. A successful first page followed by an error is an incomplete preparation, not a smaller complete run. Detect missing/repeated cursors when `has_more=true` and stop with a retryable preparation error.
4. Deduplicate by (book, side, ID); conflicting duplicates or inconsistent metadata for the same token require a fresh scan. Combine page freshness using the minimum level and logical AND of `realtime`; a decreasing level invalidates preparation.
5. Sum only eligible, known positive balances, grouped by (`token_address`, `token_id`). Format amounts with exact decimal arithmetic. A symbol alone is never token identity; do not add USDT and RWA amounts into one token total.
6. Group eligible orders by orderbook. Use a stable order (for example book address, BUY before SELL, then numeric ID) and preserve each exact list from preview through signing and receipt matching. A configurable initial cap of 10 orders per part is a starting point; it must be calibrated on the target network (§8). The relay maximum of 100 is an admission limit, not a safe gas limit.
7. Review eligible/blocked counts, totals per token, selected payment method, number of parts/signatures and fees. Explain partial completion: “Earlier completed parts remain claimed if a later part fails.”

The scan is not a frozen ledger snapshot. Another tab can claim an order after the preview; a newly closed/newer order may need a later scan. Execution decides what actually transfers. Rescan after the run and after a definitive failed part before proposing new work.

| Read response                 | What to do                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| 400                           | Invalid asset, limit or cursor scope; correct the request, restart if the cursor is invalid       |
| 401 / 403                     | Restore the correct authenticated wallet; do not silently query a different wallet                |
| 409                           | Index rollback detected; discard the preparation/cursors and restart                              |
| 429                           | Honour `Retry-After` and retry the same page; preserve accumulated candidates                     |
| 503, timeout or network error | Preparation is incomplete; retain visible progress but block signing until a full successful scan |

The owner read budget is 60 pages/minute when the production Redis limiter is configured; the returned `Retry-After` is authoritative. The backend's indexer read timeout is 10 seconds.

## 3. Payment choice and fee review

Reuse the saved Profile → Gas Payment preference: Credits by default when no explicit preference exists, or the user's explicit MVRK choice. Native balance must not silently change that choice. Lock the path for the running action; a preference change applies to a later run.

For **Credits** require an authenticated wallet, `relay/config.enabled`, and the selected book with `permitProcessRefund` in its `permitActions`. Check each book: historical discoverability does not imply relay eligibility. Show books unavailable in the selected mode and offer an explicit change to MVRK after resolving any outstanding operation. Refunds do not need a new token operator grant or cancel action.

Read the resolved `fee.feeSchedule.permitProcessRefund`: an absent variant is free, including when other variants charge. `fee.enabled=false` means no service fee. An enabled fee with unavailable configuration is unknown, not zero; do not fall back to `defaultFeeUnits` for an absent resolved variant. Check current effective credit/free-allowance availability only for a chargeable action.

Service fees are per submitted permit/part, not per order in its list. Display token units using the configured fee token and decimals; do not assume one raw unit is one UI Credit. A different chunk count or changed price requires a new preview. Do not reserve/display a pending refund as available Credits before settlement and a credit refresh.

For **MVRK** estimate the exact `processRefund` call and show the user's network fee. Check the wallet's MVRK balance. Re-estimate before sending because transfers and chain state may have changed. A relay outage never authorizes an automatic direct transaction.

## 4. Execute one part

Use a sequential loop: prepare/review → sign/send one part → resolve its outcome → confirm and wait for indexing → prepare the next part. Do not pre-sign all parts with the same permit counter.

### MVRK: direct wallet call

Build the list with raw string IDs and uppercase sides:

```ts
const orders = [
  { orderId: "12", orderType: "BUY" },
  { orderId: "12", orderType: "SELL" },
];
const book = await toolkit.wallet.at(orderbookAddress);
const method = book.methodsObject.processRefund(orders);
// Estimate this exact call with the connected wallet as source before review,
// and again before send. Attach zero native currency.
const operation = await method.send();
// Persist operation.opHash; then validate receipt/status as described in §6.
```

Persist the pre-send chain head level and the “wallet request started” state before `.send()`. A failure during estimation is definitive: no wallet request was sent. A known wallet rejection is also definitive. An exception or missing response after requesting a send can be an unknown outcome; do not assume that nothing was broadcast.

### Credits: one signed list action

The relay route uses camelCase. The readable intent for the same part is:

```json
{
  "kind": "process_refund",
  "orderbookAddress": "<ORDERBOOK>",
  "orders": [
    { "orderId": "12", "orderType": "BUY" },
    { "orderId": "12", "orderType": "SELL" }
  ]
}
```

The backend accepts the old single `orderId`/`orderType` form for compatibility. New code should use `orders[]`; never mix the two forms, even with null values. Lists contain 1–100 unique (`orderType`, `orderId`) pairs. IDs are canonical non-negative decimal strings (`0` or digits without leading zeros), at most 128 digits. The backend compares every decoded ID, side and list position to the actual signed action.

Signing recipe:

1. Fetch the actual book's `permitAndExecute` entrypoint type and storage. Extract its `%action` union and confirm `%permitProcessRefund` exists. Do not copy a hardcoded Left/Right branch index from another contract.
2. Read the wallet's current `permitsCounterLedger` entry (absent means zero). The counter is a decimal string; the optional relay `permitCounter` diagnostic field currently supports a non-negative signed 64-bit range. Do not round through JavaScript `Number`.
3. Encode `{ permitProcessRefund: orders }` with that live action type. Compute `actionHash = BLAKE2b-256(PACK(action))`.
4. Build the signed payload for the deployed generation. Legacy: `PACK(((chainId, bookAddress), (counter, actionHash)))`. With `%deadline`: `PACK(((chainId, bookAddress), (counter, (actionHash, deadline))))`. Derive a short deadline from chain time within the user's configured/default permit expiry; unsupported shapes block Credits for this book. The deadline is part of both signed bytes and the submitted permit.
5. Request a Micheline signature from the active account, then locally verify the exact packed bytes against its public key. Recheck wallet/network before and after the wallet prompt.
6. Build `permitAndExecute([permit])` with the SDK and take `toTransferParams().parameter`. There must be exactly one permit, containing `userPublicKey`, `userSignature`, `action` and, when required, `deadline`. Multiple order IDs belong inside its action; do not submit one permit per order in the outer list.
7. Persist the exact serialized request, signature and new idempotency key before POST. Then submit the envelope below. Reuse the same saved bytes/key for transport retries of this attempt.

```ts
const request = {
  intent,
  operation: {
    to: orderbookAddress,
    amount: "0",
    parameter: permitMethod.toTransferParams().parameter,
  },
  idempotencyKey: crypto.randomUUID(),
  permitCounter: counter,
};
// parameter.entrypoint = "permitAndExecute";
// parameter.value is SDK-generated Micheline, not the readable intent JSON.
```

`202` returns `{ operationId, gasStationOperationId, status }`. Store and poll the backend `operationId`. Acceptance means tracking has started; it does not mean tokens have arrived. A lost 202 response is recoverable by retrying the exact saved request/key. A changed list or new signature requires a new key, only after the previous outcome is resolved.

## 5. Progress, reload and ambiguous results

Use local UI states distinct from the relay's wire status:

| UI state                     | Meaning / available action                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Preparing                    | Reading pages or estimating; no complete amount yet                                    |
| Ready for review             | Full scan complete; eligible and blocked candidates separated                          |
| Waiting for signature        | Current wallet request only; do not open the next one                                  |
| Submitted / relaying         | Operation accepted or hash known; minimize and keep tracking                           |
| Unknown outcome              | Send/POST response lost; recover this attempt before another signature or payment path |
| Confirming                   | Matching transaction found; awaiting canonical confirmation                            |
| Waiting for indexer          | Chain success established; API has not caught up                                       |
| Part completed               | Receipt-derived payout retained; next part may be reviewed/signed                      |
| Failed / partially completed | Stop new parts; show completed payouts, failed part and recovery action                |
| Finished                     | Final scan complete; show actual received totals plus remaining/blocked candidates     |

Persist runs by (wallet, chainId, asset) with a schema version, exact ordered parts, payment mode, per-part state, saved request/key/signature, backend operation ID, hash, pre-send level for direct calls, confirmation identity and received amounts. Serialize integers as strings. Keep unresolved runs across modal close/reload; storage failure before submission blocks sending. These records contain signed authorization, so avoid logging them and retire them after safe resolution.

Use a cross-tab lock for the same wallet/network/asset. If locking/storage is unavailable, explain that resumable execution cannot safely start. Never resume signing automatically on reload: recover the existing attempt, show progress, and ask for the next wallet approval through the normal review flow. A wallet/network change pauses effects for that run.

| Situation                                          | Recovery                                                                                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST timed out, no backend ID saved                | Retry the exact serialized request and idempotency key; do not rebuild the permit                                                                                 |
| Backend ID known                                   | Poll that ID; merge socket updates into it                                                                                                                        |
| `409 PERMIT_IN_FLIGHT` points to another operation | This new submission was refused. Track the other operation as a blocker, then refresh candidates; matching intent alone is not proof this attempt executed        |
| Direct send response lost                          | Recover the hash from the wallet or accept a user-supplied hash and validate it against this saved attempt (§6); a blank/unknown hash is not permission to resend |
| `409 IDEMPOTENCY_KEY_REUSED`                       | Client inconsistency; stop and reconcile the original request, do not generate keys until one succeeds                                                            |
| Long-running or unavailable receipt                | Keep pending/unknown with retry and explorer details; elapsed time alone is not failure                                                                           |

There is one relay permit in flight per (signer, contract). Other app actions/tabs can occupy that slot. Do not adopt another request as this run merely because it names the same orders; an already-refunded order can produce identical intent with a different signature and no payout.

## 6. Confirmation and actual received amounts

Relay statuses are `pending`, `batched`, `injecting`, `submitted`, `confirmed`, `failed`, `rejected`. The first four are in progress. `failed`/`rejected` stop new parts; retain earlier completed ones. `confirmed` triggers receipt verification and indexer catch-up for this flow.

For either payment path:

1. Resolve the hash on the captured network. Select the matching manager transaction by target book, entrypoint, signer and the complete ordered refund list. Gas Station may put several users' calls to the same book into one hash.
2. For Credits, also match the exact saved `userSignature` and derive the wallet from `userPublicKey`; the transaction sender is the relayer. For direct calls, match the sender wallet and require inclusion at a level strictly newer than the saved pre-send level.
3. Require `applied`. `failed`, `backtracked` and `skipped` are unsuccessful. Keep unknown/pending if the transaction or receipt cannot be verified. Require the inclusion block to remain canonical and wait for two successor blocks (`head >= inclusionLevel + 2`); repeat the canonical check on recovery rather than trusting a cached success.
4. Calculate received amounts from the applied internal FA2 transfers of that transaction, from the orderbook to the wallet, grouped by destination token contract and token ID. Exclude other manager transactions and other recipients in the shared hash. If receipt details are unavailable, show “Amount pending verification”; do not substitute preview totals.
5. Wait for a fresh refund read whose `as_of.orderbook.realtime=true` and level is at least the inclusion level before advancing the part. Refresh balances, portfolio/summary, orders/history and relay/credit state using their existing freshness rules.
6. At the end, traverse the refund endpoint again from the first page. Report remaining/new candidates and blocked ones. Do not rewrite a successful order's lifecycle to “refunded”; lifecycle and escrow/refund state remain separate.

An order claimed elsewhere between preview and execution can be a successful no-op: `applied` is valid while actual received amount is zero. Say “Already claimed”/“No additional tokens received”, not “Received {preview}”. An internal token/KYC transfer failure rolls back its part; confirmation of another part does not make this one successful.

## 7. Failures and smaller parts

Relay errors normally use `{ error, message, remedy, detail? }`; terminal rows use `error: { code, message, remedy }`. Auth/global middleware can use the service-wide envelope without `remedy`. Parse both. Codes are extensible; never classify size failure by matching human-readable message text.

| Code / condition                                                               | Required action                                                                                                            |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Proven pre-injection `OPERATION_RESOURCE_LIMIT`                                | Offer smaller parts for the affected remainder, with a new fee/count review and fresh signature/key                        |
| `413 PAYLOAD_TOO_LARGE`                                                        | Request was too large; split and rebuild within body limits after review                                                   |
| Generic `SIMULATION_FAILED`, KYC/transfer failure                              | Explain the actual failure; do not assume a smaller part fixes it                                                          |
| `FEE_CREDIT_REQUIRED`                                                          | Refresh effective Credits; offer top-up for a chargeable action                                                            |
| `RELAY_UNAVAILABLE`                                                            | Sponsor/relay availability issue; bounded retry with the same request; never ask the user to top up to fix sponsor funding |
| `CONTRACT_NOT_RELAYABLE`                                                       | Refresh config; explain this book's Credits limitation and offer explicit MVRK after reconciliation                        |
| `SIGNER_MISMATCH`, `KYC_REQUIRED`                                              | Restore the right account or complete KYC; no blind retry                                                                  |
| `INTENT_MISMATCH`, `INVALID_PERMIT`, `UNSUPPORTED_BATCH`                       | Integration error; stop and diagnose the exact SDK payload                                                                 |
| Stale/expired permit with `re-sign` remedy                                     | Once the prior outcome is definitive, refresh candidates/counter/expiry and review a new signature/key                     |
| Transient RPC/HTTP failure with `retry` remedy, or ambiguous transport failure | Back off and reconcile/retry the same saved request; never mutate a signature already submitted                            |
| Rate limit                                                                     | Honour `Retry-After`; preserve progress and request identity                                                               |

Only shrink after a proven size/gas failure before injection. A reasonable strategy halves the affected part, preserving stable ordering; stop at one order and show the failure if it still cannot execute. Never shrink or switch to MVRK while a send is unknown. Ordinary contract rejection is not a resource failure. The relayer never rewrites the user's signed list.

Under the new Gas Station default policy, an isolated `OPERATION_RESOURCE_LIMIT` rejection returns a charged service fee exactly once, atomically with terminal status and webhook outbox. Existing deployments with an explicit `FEE_REFUND_ON` override must add that code. Ingress 413 occurs before acceptance/charge. Do not infer an arbitrary contract failure is refundable.

Refresh credits and apply later fee amendments on the operation. `feeChargedUnits=null` can mean free or refunded; without proof of an earlier charge, use “No service fee retained”, not “Returned N Credits”. Service-fee settlement and the tokens returned by the orderbook are separate totals.

## 8. Live updates and limits

| Signal / setting                          | Behaviour                                                                                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `RELAY_OPERATION_UPDATED`, wallet channel | Merge by `operationId`/`updatedAt`, dedupe `event_id`, then refetch the known operation; it does not replace receipt/indexer verification |
| Relay polling                             | About 3 seconds without a socket, 30 seconds with one; stop terminal relay polling but continue outstanding receipt/indexer verification  |
| Socket reconnect                          | Refetch open relay operations; do not adopt an unfamiliar operation into this run based on intent alone                                   |
| Direct MVRK calls                         | Track with the existing wallet/RPC/indexer client; no relay operation ID is created                                                       |
| Refund-specific notification              | No new “all refunds completed” socket/inbox type; the App derives completion from its parts and final scan                                |
| Refund page size / cursor                 | Default 100; maximum 200 raw rows; cursor length maximum 1,024 characters                                                                 |
| Refund list / intent                      | 1–100 pairs; maximum 32 KiB serialized intent                                                                                             |
| Backend submit body                       | Maximum 64 KiB including the signed operation and wrapper; measure UTF-8 bytes, not string length                                         |
| Forwarded envelope / GS ingress           | Backend defensive cap 240 KiB; Gas Station ingress 256 KiB; the App must obey the tighter backend limit                                   |
| Idempotency key                           | 1–128 printable ASCII characters, without spaces; one per signed attempt                                                                  |
| Initial part size                         | Suggested configurable cap 10; validate gas and serialized size for actual deployed contracts                                             |
| UI flag                                   | Suggested `REFUND_ALL_ENABLED=false` by default; disabling new submissions must preserve tracking of saved attempts                       |

Preserve headroom below transport limits. Limit outgoing signed body bytes before POST, not just the order count. Changing flags/config must not abandon a request that might already be on chain.

## 9. Acceptance checks for the App

- More than 1,200 historical orders and several books are traversed; a page with no items and `has_more=true` does not end the scan.
- Wallet/asset/network switches, repeated cursors, 429, stale metadata, rollback and upstream failures never become a false “zero refunds” or enable an incomplete preview.
- IDs/amounts above 2^53 remain exact; BUY/SELL with the same ID and two token IDs at one address remain distinct.
- Filled BUY surplus and deferred net SELL refunds use API units; mixed tokens have separate totals.
- Full ordered list matches the intent and signed action; both deployed permit generations are tested with real offline signatures and negative signature/counter/deadline fixtures.
- Direct and Credits paths use explicit payment preference, show fees, and never silently fall back; a free refund works with zero paid Credits.
- Only one signature/part runs at a time. Double clicks/tabs, reload, changed wallet and unknown POST/send outcomes cannot start duplicate work.
- Recovery rejects a foreign receipt, an older identical direct refund, a different Credits signature and unrelated operations inside the same Gas Station hash.
- Two parts with first successful/second failed retain the first payout. Receipt-derived no-op is displayed as zero additional payout.
- Resource/413 failures permit bounded shrinking and a fresh review; ordinary contract failures do not. Single-order failure terminates shrinking.
- Chain application, canonical confirmation and indexer catch-up are separate states; final rescan reports remaining/new/blocked balances.
- Fee refunds are shown only from settlement evidence; disabling the feature keeps unresolved operations recoverable.
