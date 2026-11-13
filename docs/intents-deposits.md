# 1Click (NEAR Intents) deposits

"Swap From Any Chain" in Deposit Funds lets an Equiteez user pay from a
configured source chain/token and receive wUSDT on Mavryk Basenet. The user
signs **one** transaction: funding the 1Click deposit address. The shared
backend then sponsors the forward into the existing bridge, and the bridge
signers mint on Mavryk. It runs entirely inside Equiteez; nothing links to
the standalone bridge.

Spec and tickets: [`near-intents/`](../near-intents/) (`plan-intents.md`,
`task-1.md` … `task-6.md`). The direct bridge is documented in
[`bridge-tracking.md`](bridge-tracking.md) and is unchanged by this feature.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `INTENTS_DEPOSIT_ENABLED` | off | `true` shows the tab and starts tracking. |
| `INTENTS_API` | — | Backend origin; requests go to `<origin>/v1/...`. |
| `INTENTS_API_MODE` | `http` | `mock` uses the in-browser simulator. |
| `INTENTS_MOCK_DEPOSIT_ADDRESS` | `0x…dEaD` | Testnet address the mock asks the wallet to fund. |
| `INTENTS_SEPOLIA_RPC_URL` | public | RPC for the Sepolia source chain. |

Source chains with a funding adapter: `INTENTS_SOURCE_CHAINS` in
`app/consts/intents.ts` (Arbitrum Sepolia, Sepolia). They are added to the
wagmi config after the direct bridge chain, which stays the default and the
only chain the direct bridge's wrong-network check accepts.

### Mock backend

`app/lib/apis/intents/intents.mock.ts` implements the same `IntentsApi`
interface: a static catalog (Arbitrum Sepolia USDT, Sepolia ETH, and an
unsupported Base Sepolia USDC route), idempotent `POST /operations`, and a
time-based lifecycle after the deposit hint (detected +4s, swapping +10s,
delivered +18s, forwarding +24s, wrapped +32s), kept in `sessionStorage` so
reloads can be tested. Force branches with
`?intentsMock=refund|expire|busy|sponsorship|fail|below`. In mock mode the
funding panel also offers **Simulate Funding**, which records a fake hash
without a wallet request.

## Code map

| Concern | Location |
| --- | --- |
| Contract (zod), HTTP client, access adapter, mock | `app/lib/apis/intents/` |
| Route availability, amount checks (raw units) | `app/lib/intents/intentRoute.ts` |
| Quote key, expiry, material change, error copy | `app/lib/intents/intentQuote.ts` |
| Record model, monotonic merge, mismatch check | `app/lib/intents/intentOperation.ts` |
| Funding call shape and error classification | `app/lib/intents/intentFunding.ts` |
| Deposit hint with retries | `app/lib/intents/intentHints.ts` |
| Wallet funding (wagmi actions) | `app/contracts/intentsFunding.contract.ts`, `useIntentsFunding` |
| Persisted store, tracker, widget mapping, receipts | `app/providers/TransactionsProvider/intent*.ts` |
| Modal orchestration | `app/hooks/useIntentsDeposit.ts`, `useIntentsRoutes.ts` |
| Views | `DepositFunds/components/Intents{View,QuoteView,FundingPanel,StatusView}.tsx` |

## Backend contract (draft v1)

Validated at the boundary in `intents.schema.ts`; if BE-02/BE-03 differ, only
the schema and `intents.http.ts` should change.

- `GET /v1/routes` → `{ routes: IntentRoute[] }`.
- `POST /v1/quotes` → preview quote (not executable).
- `POST /v1/operations` with `Idempotency-Key` → executable operation with
  `funding { chainId, depositAddress, token, amount }`. The backend resolves
  the forwarder; the UI never looks it up.
- `POST /v1/operations/:id/deposit { txHash }` → reconciliation hint.
- `GET /v1/operations/:id` → current snapshot (`version`, `updatedAt`,
  `status`, `sourceTxHash`, `deliveryTxHash`, `forwardTxHash`,
  `forwardLogIndex`, `refund`, `error`).
- Errors: `{ error: { code, message } }` with `sponsorship_unavailable`,
  `destination_busy`, `quote_expired`, `below_minimum`, `route_disabled`,
  `unauthorized`, `rate_limited`, `not_found`, `internal`.

**Access.** The Equiteez RWA bearer token is not sent. The default adapter
(`originAllowlistAccess`) sends `X-Intents-Client: equiteez` without
credentials and relies on the backend's origin allowlist. Swap the adapter
once the authorization contract is agreed.

## Lifecycle

1. **Form.** Route, amount (validated in raw units against min/max/balance),
   and the active Equiteez Mavryk account as the fixed recipient. Requires
   the authenticated tracking session.
2. **Review.** Preview quote with expected/minimum output, recipient and an
   expiry countdown.
3. **Confirm.** A local record (`localId` = idempotency key) is saved before
   `POST /operations`. The response must match the request (recipient,
   route, amount, source, chain, token, funding amount) or it is never funded.
   A worse executable quote needs another confirmation. Transport errors keep
   the key; definitive rejections use a new one.
4. **Fund.** `fundingState = "prompted"` is saved before the wallet call;
   then the native transfer or ERC-20 `transfer` goes to `depositAddress` with
   the backend's exact amount. The hash is saved even if the account changed
   meanwhile (it belongs to that account's scope), and the hint is sent.
5. **Track.** The modal switches to the status view; the global widget shows
   the same model. Minimize releases the modal's hold and the card appears.

Quote invalidation: account, source wallet, route (network + token) or
amount changes drop an unfunded quote and mark its record `abandoned`. After
the wallet was asked, only an Equiteez account change leaves the view, and
the operation keeps being tracked in its own scope.

### Never sending twice

Only `not_started` and `rejected` (declined in the wallet) allow a wallet
request. `prompted`, `broadcast`, `confirmed`, `unknown` (RPC error, timeout,
cancelled/replaced transaction) and `reverted` never prompt again. Only an
explicit new deposit creates a new operation. Hint failures never block or
resend; the tracker retries them.

### Persistence and isolation

`localStorage` key `equiteez:intents:v1:<env>:<account>`; `<env>` is the
backend origin (or `mock`). Writes are synchronous. Unreadable data is kept
and tracking falls back to the session. Other tabs' records are merged.
Settled records older than 14 days are pruned. There is no cross-device
discovery: that needs an authenticated list endpoint.

## Progress mapping

| Backend / funding state | Widget |
| --- | --- |
| broadcast/confirmed, `awaiting_deposit` | Step 1 Send Funds |
| `deposit_detected`, `swapping` | Step 2 Swap |
| `delivered`, `forwarding` | Step 3 Forward To Bridge |
| `wrapped` | Step 4 Bridge To Mavryk, neutral, dismissible, **not success** |
| `wrapped` + correlated receipt | Success (auto-expires like bridge cards) |
| `refunded` / `expired` / `failed` | Final warning |
| `prompted` (after reload) / `unknown` / `reverted` | "Check your wallet" warnings |

Cards use the composite identity `intent:<localId>` and share the existing
holds, discovery, dismissal and removal persistence.

## Receipt correlation

The only join key is the sponsored forward's `ERC20WrapAsked` identity:
`forwardTxHash:forwardLogIndex`. Evidence is the wallet API's `executed`
deposit row or two distinct `COMPLETED` signers on that identity. The
funding and delivery hashes are never passed to the bridge store. A bridge
record matching a forward identity is owned by the operation: no second
card and no duplicate "Bridge deposit arrived" toast. On correlation the
card completes, the existing wallet/portfolio/activity/notification queries
are invalidated, and one "Deposit arrived" toast is shown, guarded by a
persisted `announced` marker. Balances/activity are also refreshed once
when the backend reports `wrapped`. Without correlation the card stays on
neutral step 4 and balances update through the existing data flows.

## Open dependencies

See `near-intents/plan-intents.md` §6. Blocking for production:

- Final API contract and access adapter (BE-02/BE-03).
- Which testnet routes 1Click supports.
- Whether the backend returns `forwardTxHash` + `forwardLogIndex`, and
  whether the RWA bridge API/notifier indexes the new WrapBridge deposits.
  Without that, the receipt stays neutral by design.
- Operation updates over the existing notifier channel (polling only today).
- Design handoff (EQ-D-02/03/04) for copy, the tab name and step labels.
- BE-09 smoke test against the shared environment.

## Tests

`npx vitest run app/lib/apis/intents app/lib/intents app/contracts/intentsFunding.contract.test.ts app/hooks app/providers/TransactionsProvider app/routes/_index`

`app/hooks/useIntentsDeposit.integration.test.tsx` runs a full deposit
(double-clicked confirm and fund, modal close/reopen, reload, account
switch, refund, outage) against the mock backend and the real tracking
providers, with wagmi mocked at the action boundary.
