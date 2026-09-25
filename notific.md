## 0. What it is

A truthful, resumable view of both bridge directions, without a spinner on anything nobody can observe.

- **Deposit** (Ethereum → Mavryk). The user signs on Ethereum; after the lock the state lives on Mavryk. The backend now serves the whole lifecycle, including the phase no chain shows - the source-chain confirmation wait - as `GET /wallets/{w}/bridge/deposits`.
- **Withdraw** (Mavryk → Ethereum). The user signs on Mavryk; after the lock the state lives on Ethereum, which the backend cannot read. The Mavryk leg is in the Activity feed at once, with the declared far-chain address; the far-chain completion is the App's own EVM client, as before.

The two are not symmetric and the guide does not pretend they are. What the backend adds, in one table:

| Surface                            | Deposit                                               | Withdraw                                                                    |
| ---------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| In-flight state                    | `/bridge/deposits` (four statuses, `n/N`)             | none - the App's viem tracker                                               |
| Activity feed row                  | once minted; `evm_tx_hash` + `log_index`              | at once; `evm_destination`                                                  |
| Cache retirement on landing        | feed, portfolio, summary retired on the mint          | feed, portfolio, summary retired on the first signer transition             |
| Socket frame (`channel: "wallet"`) | `BRIDGE_DEPOSIT_UPDATED` per signatory                | `BRIDGE_WITHDRAWAL_UPDATED` per signatory, when the signer knows the sender |
| Inbox row                          | `bridge_deposit_completed` / `bridge_deposit_stalled` | `bridge_withdrawal_failed`                                                  |

## 1. Endpoints

```
GET /api/v1/wallets/{wallet}/bridge/deposits?status=&fresh=1
GET /api/v1/wallets/{wallet}/transactions          (rows gained bridge fields)
```

Both are wallet-bound (`403` for another wallet's path). JSON is snake_case.

### The deposits list

`{ "deposits": [ … ] }`, newest first, **unpaged and bounded to the 50 most recent** deposits - what is in flight plus recent history; a paged tracker could miss the very deposit the user is waiting for. Older completed deposits are in the feed only.

Both inbound flows share the row: an EVM-origin token arriving (wUSDT; `token_evm` set) and a MAV-origin token returning from Ethereum (`token_evm` empty, `token` = the Mavryk contract, native MVRK by its canonical address). The second flow has no App-side tracker entry - it started on the far chain - so render it from the list alone.

| field                                 | what to do with it                                                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `status`                              | `confirming` / `signing` / `executed` / `stalled` - closed set, §2                                                                      |
| `evm_tx_hash`, `log_index`            | the deposit's identity and the join key to your local entry; explorer link from your chain config                                       |
| `signer_count`, `signatory_threshold` | render `n/N`; `signatory_threshold` is `null` when the contract storage could not be read - show `n/?`, never a default                 |
| `required_confirmations`              | the source-chain target while `confirming`; `null` past that phase                                                                      |
| `amount`, `decimals`                  | exact decimal in source-token units; `null` together when the token is unregistered - show `amount_raw` unscaled, never a guessed scale |
| `token`, `token_evm`                  | the Mavryk contract received and the source ERC20; `token` is `null` until the bridge registry resolves the wrapped contract            |
| `failed_signatories`, `reason`        | who reported a terminal failure and why; see §2 for when this is not a failure of the deposit                                           |
| `chain_from`, `chain_to`              | slugs, same rules as the feed (§1, the feed)                                                                                            |
| `created_at`, `updated_at`            | RFC 3339; `updated_at` is the last signer transition                                                                                    |
|                                       |                                                                                                                                         |

Filters and freshness: `?status=` narrows to one status; an unknown value is a `400`. The list is cached per wallet for 20 s with no stale band, so polling faster than that returns identical bytes. `?fresh=1` forces a cold read under the same per-wallet budget as the feeds (`X-Cache-Bypass` on the response says whether it was honoured); you need it only in the no-socket case of §3. MvKT or Postgres down is a `503` - keep the last list you have and retry.

### The feed

Transfer rows (`deposit` / `withdrawal`) carry, in addition to what they always had:

- `chain_from`, `chain_to` - always present on transfer rows, omitted on order rows. Equal values mean an intra-chain transfer; a differing pair is a bridge leg. Slugs are an **open set** and name the chain _family_: `ethereum` is Sepolia on every environment today, prod included. Map slug → display name and explorer base in your own chain config; never derive a chain id from the slug.
- `evm_tx_hash` + `log_index` on a bridge-**in** row: the source-chain lock, ready for an explorer link. Optional - absent when the originating call is no longer resolvable - so render the row without the link rather than gating on it.
- `evm_destination` on a bridge-**out** row: the far-chain address the user declared. Optional on the same terms.

Two rows to expect: a wUSDT mint has an **empty `from`** (a mint carries no sender; the chain comes from the wrapped-token registration), and native MVRK moves are transfer rows with `id` namespaced `native:<op-id>`.

**Transfer rows carry no `status`, and never will.** A transfer row _is_ the executed movement; the in-flight states live on the deposits list. Delete the `|| "CONFIRMED"` fallback and render no pill on transfer rows; `status` stays an order lifecycle.

## 2. Deposit statuses and what to render

| status       | meaning                                                                                                                                                                                            | render                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `confirming` | locked on Ethereum, no Mavryk request yet. **Most of the wait**: the signer acts only after 12 Sepolia blocks (~2.5 min) - your own 3-confirmation lock count is the lock's, not the bridge's      | "Waiting for the bridge" with `required_confirmations` if you show a target; expected time "usually 3–5 minutes" |
| `signing`    | the request is on Mavryk below the threshold; measured at 5–20 s, so a poller usually skips it                                                                                                     | "Validators sign n/N"                                                                                            |
| `executed`   | minted; the row is also in the feed                                                                                                                                                                | "Arrived" - this is the only state that earns the success toast                                                  |
| `stalled`    | a signatory reported `FAILED` / `TIMED_OUT` / `REORGED` (the deployed signer gives up on finality after 10 min), or the request sat on the ledger past its 24 h signing deadline without executing | warning with `reason` and the explorer link; never a spinner                                                     |

Rules that are easy to get wrong:

- `failed_signatories` beside `signing` or `executed` is legitimate: the bridge is 2-of-2 today and one signatory can fail while the other completes. Show it as detail, not as the deposit's status.
- `status` is derived from the chain's `executed` first, so a stale event can never demote a completed deposit; the signing deadline counts only for a request that has not executed.
- `log_index` can change once: until finality it is the first sighting, and a reorg re-inclusion moves it. Join your local entry by `evm_tx_hash` first, then adopt the list's `log_index`.
- A deposit the signer never published (it predates the stream, or its events fell out of the 7-day topic retention) is absent here even though it completed - it is still in the feed.

## 3. The deposit flow, end to end

1. **Lock on Ethereum** (App, wagmi). Resolve the modal on the lock hash - submitted-first, no "confirmed" or "available" copy inside it - and hand the receipt wait to a background tracker. Read the `ERC20WrapAsked` log index from the receipt and persist `{ evm_tx_hash, log_index, amount, token, locked_at }` per wallet as a **map** (concurrent deposits are normal). This local entry is the fast path for the active tab only.
2. **Track from the list.** From the lock receipt on, the deposits list is the source of truth: it knows the deposit while `confirming`, which nothing on chain shows, and it survives a reload, a cleared profile and a second device. Match rows to local entries by `evm_tx_hash`; a row with no local entry is a deposit started elsewhere (MetaMask, mBridge, a returning MAV-origin token) and is rendered from the row alone.
3. **With the socket up** (test today): every `BRIDGE_DEPOSIT_UPDATED` frame is a trigger for **one** refetch of the list, without `fresh=1` - the API retired its own list cache on that event. Decide the toast from the refetched row's `status`, not from the frame: a signatory's `COMPLETED` means "my signature landed" and the first one arrives before any mint. Two signatories are two streams per `aggregate_id`; their statuses may diverge and the frame vocabulary (`PENDING` … `REORGED`) is the signer's, never `executed`.
4. **On `executed`**: toast success, mark the entry terminal, and refetch the feed, portfolio and activity summary. The backend already retired those caches on the mint (the write that reached the threshold), so no `fresh=1` is needed on this path. Use `fresh=1` on that refetch only when your own tracker reached `executed` from the chain while the signer stack is dark and no event could have retired the caches.
5. **On `stalled`**: warn with `reason` and the explorer link; the 24 h copy ("the request expires 24 h after creation") applies only when no `failed_signatories` explain it.

The bell follows the same facts: `bridge_deposit_completed` and `bridge_deposit_stalled` rows land in the inbox (entity `bridge:<aggregate_id>`, payload = the signer's fields: `amount`, `erc_token` or `mavryk_token`, `initial_tx_hash`, `reason`), so a refetch of `/notifications/summary` on the same frame keeps the badge honest. A `completed` row the API backfilled from the ledger on a list read has `event_id: null`.

## 4. Withdrawals

**The Mavryk leg is the App's own operation** and is served as before: after `.send()`, gate success on `operation.status()` (`applied`; `failed` / `backtracked` / `skipped` is a failed withdrawal, never "Confirmed on-chain"), then it appears in the feed as `withdrawal`, `mavryk → ethereum`, with `evm_destination` - one refetch after the `confirmation(1)`; the backend retires the feed and value caches on the signer's first transition as well.

**The far-chain completion is not served by the backend.** The App's viem client observes it directly:

| flow                                  | join key                                                                           | signatures                                                              | done                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `wrapToken` (MAV-origin token out)    | `keccak256(utf8("{opHash}:{counter}"))` (+ `":{actionIndex}"` for a permit action) | EVM MinterBridge `MintSigned` per signatory, `signatoryThreshold()` = N | `MintExecuted` - its `transactionHash` is the far-chain hash to show                   |
| `unwrapToken` (EVM-origin token back) | same                                                                               | **no count exists** - render the step as unknown, never a spinner       | `isMavrykOperationProcessed(id)` / `ExecutionSuccess`; `ExecutionFailure` is a failure |

Persist `{ opHash, counter, actionIndex?, kind, amount, evmDestination }` on `.send()` as a map and resume on reload. The signer itself waits 2 Mavryk blocks before acting and 10 confirmations on Ethereum before it calls the operation confirmed; `mintRequestExpiry()` (24 h) is the stall bound.

What the backend adds on this side, when the signer stack is live:

- `BRIDGE_WITHDRAWAL_UPDATED` frames per signatory (`SUBMITTED` collapses like the progress statuses; terminal ones always arrive). Use them to advance the tracker and to refetch the feed and activity; **a permit-based withdrawal reaches nobody** - its on-chain sender is the relayer, the signer does not know the user - so never make a withdrawal's UI depend on receiving a frame.
- An inbox row `bridge_withdrawal_failed` on a terminal failure. There is no "withdrawal completed" kind: the completion is the App's EVM observation.

Pinned on-chain facts the App's side needs (basenet, verified 2026-09-08; the source of truth is the signer's `dipdup.contracts.yml`, and Ethereum here is Sepolia):

| role                                                             | address                                      |
| ---------------------------------------------------------------- | -------------------------------------------- |
| MAV WrapBridge (locks MAV-origin tokens)                         | `KT1GGbDZKTEYGF9BuCnc2T9aZQVdJ3C5TrK7`       |
| MAV MinterBridge (mints EVM-origin tokens; `mintRequestsLedger`) | `KT1QgGZLNv8tB512woJLDfL32gE8J6PcjWzP`       |
| wUSDT (FA2, decimals 6)                                          | `KT1J8yjtFGY6fiqjSNLpUjDnX2bj2HsUizAi`       |
| EVM MinterBridge                                                 | `0x158Bfa7488EbCaF18F96D11a8aad7993ec232348` |
| EVM WrapBridge (`wrapToken(address,uint256,bytes)`)              | `0x476a30d098eD197c2b109abaBbf5135D49df0967` |
| Mock USDT (ERC20, decimals 18)                                   | `0x0111C65C13b3Ee07662340692CBA957B29572F27` |

## 5. Live updates, in one place

| signal                            | where                         | what to do                                                                                                                     |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `BRIDGE_DEPOSIT_UPDATED` frame    | notifier, `channel: "wallet"` | one list refetch (no `fresh=1`); toast from the row; on `executed` refetch feed/portfolio/summary and `/notifications/summary` |
| `BRIDGE_WITHDRAWAL_UPDATED` frame | notifier                      | advance the withdraw tracker; refetch feed and activity                                                                        |
| `TOKEN_LEDGER_TRANSFER` frame     | notifier                      | unchanged; note a bridge-in **never** publishes one - the mint is invisible to the token indexer                               |
| MvKT SignalR `token_balances`     | already subscribed            | the wUSDT balance delta is a fine secondary "arrived" signal; the list's `executed` is the primary                             |

## 6. Things that are not bugs

- The deposits list is empty and no bridge frame or inbox row ever arrives: the signer stack is not deployed yet (§0). The feed fields work regardless.
- A deposit shows `confirming` for minutes with nothing else moving: that is the source-chain finality wait, the longest phase, and the reason the list exists.
- `signing` is rarely observed: the on-chain flight is 5–20 s.
- `failed_signatories` is non-empty on an `executed` deposit: one signatory failed, the other completed; the deposit is fine.
- `signatory_threshold` is `null`: the contract storage read failed; the API reports unknown rather than a plausible constant. Show `n/?`.
- `amount` is `null` with `amount_raw` present: the token is not registered on the bridge (or, for a returning MAV-origin token, not in the catalog).
- A bridge-in row in the feed has an empty `from`; a transfer row has no `status`; `evm_tx_hash` / `evm_destination` are missing on an old row whose origin could not be resolved.
- After a cache retirement `/activity/summary` answers `transfers: null` until the feed refills; it is unknown, not zero.
- A withdrawal signed through a permit (gasless path) gets no frame and no inbox row; the feed row and your EVM tracker are its only surfaces.
