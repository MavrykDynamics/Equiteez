# Gasless trading

## Implementation status

Phase 0 is partial as of 2026-10-22. Phase 1 HTTP adapters and pure policies are implemented following the user’s explicit instruction to use `api.yaml`; Phase 2 preferences and direct fee safety are implemented; Phase 3 ordinary permit construction, local verification and reusable signing review are implemented; top-up signing remains blocked on deadline reconstruction. Phase 4 durable ordinary lifecycle/recovery and persistent progress are implemented; trade routing and Credits execution remain deferred to Phases 5–6. `gas.md` remains the requirements source; `gas-plan.md` records progress. The owner confirmed that implementation must be frontend-only and backend access is unavailable. The user subsequently supplied `api.yaml` (OpenAPI 0.15.0), which now supplies the HTTP schema evidence. Subsequent authorized read-only requests were blocked by Cloudflare as recorded below. No backend change, signing, mutation or deployment was performed.

## Existing boundaries and configuration

Reuse `app/lib/apis/rwa/client.ts::rwaApi` and its configured `rwaApiUrl` from `RWA_API`. Relay routes are relative `/relay/...` and `/wallets/{wallet}/relay/...`; do not introduce a Gas Station client or sponsor credentials. The existing client injects authentication and retries once after a 401 refresh; future mutation handling must preserve the exact payload/key across that retry.

Reuse `WalletProvider/WalletCore.client.ts`: Beacon requests `basenet`, and the toolkit uses the RPC selected through `app/consts/rpcNodes.ts`. The current RPC schema accepts only the Basenet URL. Read chain identity from that toolkit before signing; do not infer it from a historical contract address.

The existing notifier supplies wallet events. RelayProvider consumes RELAY_OPERATION_UPDATED through that same notifier and owns scoped relay recovery. Bridge `TransactionsProvider` uses an Ethereum-chain/destination/bridge-address scope: it is not a relay scope. Primary purchases and bridge execution remain outside secondary orderbook relay intents.

## Frontend scope definition

Future relay query keys, recovery records, operation admission, timers and notification markers must use a versioned tuple containing:

- Configured wallet network (`basenet` currently).
- Selected toolkit RPC URL and the node chain ID when resolved.
- Configured RWA API base URL, including its pathname, using the existing normalized `rwaApiUrl`. An origin alone cannot distinguish environments served under separate paths.
- Connected wallet address, with exact case retained; authenticated wallet must match for protected work.

Use an explicitly unresolved chain state for read-only initialization. It must not match a previously resolved scope or authorize signing. Resolve the chain before mutation/recovery replay, rebuild scope on any constituent change, and ignore late results from the previous scope. Never merge two resolved chain IDs. Scope serialization must be unambiguous (for example a versioned JSON tuple), not concatenation with an unescaped delimiter. Never include JWTs or signatures in keys or logs.

Public config can omit wallet identity, but remains API/network scoped. A shared socket topic is not environment evidence: only admit a frame for the matching wallet and an operation already known through this scope's API/local accepted attempt. Unknown IDs cannot create local operations. Reuse the existing socket, not a second connection.

These are relay lifecycle requirements for later phases. Phase 2 installs a separate preference owner with the same network/API/wallet tuple; it does not store or replay relay operations.

## Decisions and dependencies

Owners below are required roles from the requirements, not named reviewers or recorded approvals.

| Dependency | Required owner | Status and affected work |
| --- | --- | --- |
| Deployed permit script, counter storage/view, domain envelope, packing/hash/signature vectors and supported key curves | Contract maintainer + API maintainer | Unavailable; blocks every permit signature, including fee-off orders and operator grants. Login challenge encoding is not a substitute. |
| Exact response schemas and sanitized fixture provenance | API maintainer | HTTP schemas supplied in `api.yaml` 0.15.0; 30 synthetic schema-referenced examples validated. Captured responses, owner review, a complete top-up read intent and a formal socket schema remain unavailable. |
| Top-up duplicate-signature handling and authoritative correlation after lost POST response | API + contract maintainer | Unresolved; blocks safe paid top-up submission/recovery. No frontend-generated idempotency field may be added to this route. |
| Credit denomination, tariff, rounding, variant prices and preset units | Product + Gas Station owner | Unresolved; blocks numeric paid UI/conversion, not fee-off policy work. |
| Free allowance inclusion in action counts and mixed paid/free display | Product + Gas Station owner | Unresolved; blocks effective paid allowance math. Do not sum counts or mint five Credits. |
| Saved preference ownership | Frontend + product/API owner | Authorized and implemented in Phase 2: local versioned wallet/network-scoped explicit choices. Cross-device backend persistence remains unspecified. |
| Top-up history presentation | Product + frontend | Combined feed cannot be assumed. Separate Top Ups cursor paging is the proposed frontend-only fallback, pending product acceptance. |
| Fee coverage and exact refund wording | Product + contract/API owner | Preserve protocol fees; settled null permits neutral wording only. Exact refund amounts require prior-charge/ledger evidence. |
| Fee-on/off rollout and approved development environment | Product + deployment owner | Unconfirmed. Runtime config is authoritative; September addresses/state are not current eligibility. |
| Recovery/mobile/error presentation | Design + frontend | Safety requirements exist; final copy/layout review remains outstanding. |

Frontend-only scope does not remove these evidence dependencies. Independent Phase 1 API/policy work has now been implemented from the supplied HTTP contract; unresolved signing/product evidence does not prevent that work.

## API evidence resolved on 2026-10-22

`api.yaml` is the supplied HTTP contract. [Schema-derived examples](fixtures/relay-api.json) pin its SHA-256 and version; they are synthetic frontend test data with non-executable identifiers, not live captures, pricing policy or signing vectors. They cover config off/fee-off/fee-on, credits off/zero/mixed, all five in-scope ordinary intent kinds, limit expiry, ordinary acceptance/replay, top-up acceptance, every operation status, a later fee charge, cursor exhaustion and both error envelopes. Each example references its OpenAPI schema rather than duplicating application types. Runtime parsers are implemented in `app/lib/apis/rwa/relay/relay.schema.ts`.

Resolved details and differences from the earlier guide:

- `RelayFeeConfig.feeSchedule` maps variants to string amounts; an absent variant is documented as free. `defaultFeeUnits` also exists: do not reinterpret it as an undocumented charge for absent variants. Token ID, decimals and freeAllowanceOps are integers. Only enabled is schema-required; paid execution must still require complete usable fee configuration.
- `actionsRemaining` values and `freeAllowanceRemaining` are integers. Inclusion of free allowance in the former is still unspecified. Credit denomination and monetary display remain product decisions.
- Order currency is a string; orderType is BUY or SELL. `orderExpiry` is optional nullable date-time, not a raw nat. `isMarketOrder` is optional. Operator tokenId is a canonical decimal string; keep frontend output as a string despite documented integer backward compatibility.
- Ordinary 202 uses `RelayOperationAccepted`, whose status is the full status enum; an idempotent replay need not be pending. Its relayer ID is a string and may be empty. Full GET allows a null relayer ID. Do not invent nullable acceptance from GET nullability.
- Top-up 202 is **different**: operationId, gasStationOperationId, signerAddress and amountUnits; it has no documented status field. A local pending seed is a client tracking state, not a returned status.
- Full GET required fields/nullability and list cursor shape are specified. Top-up intent remains a free-form object, without an exact dedicated read schema. The notifier body is referenced but has no formal schema here.
- Idempotency keys are 1–128 printable ASCII characters **without spaces**. The API resolves the guide's wording ambiguity.
- Current permit envelopes require a fourth deadline field when the deployed schema specifies it; legacy three-field envelopes also exist. Flat/right-comb encoding is supported. Deadline is an integer timestamp or RFC3339 string. This does not define the full signed domain, counter lookup, packed bytes or known-good signature vector. Never hardcode the older three-field example.
- API also supports launchpad purchases/operators and a launchpad contract kind. Tolerate them in read/config data without enabling primary relay execution: this plan remains secondary-orderbook-only.
- Historical balance steering and fallback wording in API descriptions do not override `gas.md`: default Credits, explicit saved MVRK selection, no automatic paid fallback.

Validation used the installed YAML parser and Ajv on the supplied OpenAPI schema, translating OpenAPI nullable to a JSON Schema null union and ignoring discriminator/example annotations. All 30 examples passed; a negative credits-unit/count type case was rejected. This is static schema validation only, not an HTTP mock test or verification of contract validity. No dependency or application schema was added.

## Acceptance fixture handoff

The schema-derived bundle above is available; no captured or owner-reviewed signing fixture bundle is available. Do not label manually authored examples as captured responses or signing vectors. Once available, keep fixtures beside the owning API/contract tests, with a manifest recording source revision, network/chain, capture date, script identity, sanitization and reviewer. Exclude private keys, JWTs and reusable live authorizations. Sanitizing a signed payload invalidates its signature; use public test vectors with no funded authority for signature tests.

Required evidence:

| Fixture group | Required cases and unresolved details |
| --- | --- |
| Config | Schema-derived disabled and enabled fee-off/fee-on examples are present; live collector/token identity and owner review remain outstanding. |
| Credits | Fee-off `{ enabled: false }`; fee-on zero/positive, mixed free/paid, variant counts and exact types/inclusion semantics. |
| Intent | Buy, sell, 1–10 same-book cancels, refund, operator addition and read-only top-up. Currency/orderType are pinned by the API; complete top-up GET intent remains unspecified. Raw nat amounts/IDs remain strings. |
| Acceptance/read | 202 including null relayer ID; full GET for every status, field nullability, timestamps, errors, retained/null fees and actual ID fields. |
| Socket/list | Partial wallet event envelope and event_id, later terminal fee amendment, two cursor pages and null exhaustion. Partial events must not erase GET-only fields. |
| Errors/headers | Relay `{ error, message, remedy, detail? }` and service `{ error, code }`; all remedies, 409 operation ID, Retry-After and X-Cache-Bypass. API confirms no spaces in idempotency keys. |
| Permits | Each action's live type, counter read and domain; packed action, hash, signed envelope, public key/address, signature and resulting transfer parameters. Include wrong chain/counter/recipient/token, altered bytes and supported wallet curves. No synthetic positive vector can prove deployed compatibility. |
| Top-up recovery | Accepted-but-response-lost example, repeat-signature outcome, status-independent correlation including already-terminal operations, and evidence distinguishing an absent submission from delayed visibility. |

Fixture activation is not implemented. Its acceptance conditions are an explicit development-only flag **and** a development build guard, a pinned approved API/RPC/chain tuple, and tests proving production cannot load it. Until the tuple and vectors are supplied, keep activation absent; do not override catalog eligibility with the historical test triple.

## Required behavior for later phases

Credits is the default selection independent of native balance; Profile edits remain drafts until explicit Save succeeds. Only proven explicit choices may be restored. Storage failure retains the prior active method. No legacy balance-derived `mav` migration is permitted. Persistence ownership still needs resolution above.

Gasless eligibility requires config, matching authentication and the exact contract/action set. Fee-off skips credits/top-up requests. Direct MVRK uses existing wallet execution with a known fee estimate and sufficient native balance; relay failure never silently selects it.

Freeze reviewed scope and intent before signing. Sequential gasless execution is required top-up, required persistent operator grant, then order, waiting for confirmed at each step. Cancel/refund need no grant. Re-read counter/state between steps; setup confirmation is not order success. Reuse order payload/tick validation; preserve primary execution.

Persist recoverable ordinary attempts before POST; exact payload/key retries use 1/2/4-second backoff, at most three retries, respecting longer Retry-After. Unknown outcomes remain locked across reload and cannot switch transport. Re-sign only after conclusive unusability with refreshed state, at most two re-sign attempts. Top-ups have no documented idempotency/correlation contract and remain blocked pending evidence.

Poll nonterminal known operations at three seconds, or thirty while the notifier is authenticated for this wallet. Merge GET/socket updates by updatedAt; retain partial-row fields and accept later fee amendments. Follow every open-list cursor; use status-independent reconciliation for uncertain submissions. Ten minutes means Still processing, not failure. Reload resumes tracking, never automatic remaining signatures.

Credits require authoritative exact unit math and agreed tariff/free semantics. Pending top-ups overlay spendable balance and confirmation triggers refresh, never a local balance increment. Null settled charge does not prove a specific refund. Top-up history uses relay rows and its own cursor semantics unless an authoritative combined feed exists; do not fabricate numbered totals or unsupported query parameters.

## Validation and continuation

2026-10-22: inspected wallet/RPC configuration, RWA client/base URL, notifier event enum, bridge scope and package scripts. No runtime code changed. No mocked test, live API, wallet signature or fixture-owner review is claimed. Documentation/link checks are recorded in `gas-plan.md`.

Next: obtain a deployed contract script/storage reference and known-good public permit vectors, plus the missing socket/top-up recovery evidence from the matrix above. HTTP schema acquisition is complete; do not repeat it. Backend write access is unnecessary; authoritative read-only evidence is sufficient. Then pin typed fixtures, implement and test the guarded fixture activation, resolve outstanding decisions one at a time, and complete Phase 0 review before marking it complete.

## Live retrieval attempt — 2026-10-22

The user authorized read-only access with a wallet and bearer token. The API origin was taken from the existing `RWA_API` configuration. Sanitized responses are in [relay-api.live.json](fixtures/relay-api.live.json); credentials were not saved.

- GET `/relay/config`: HTTP 403, Cloudflare error 1010 (`browser_signature_banned`).
- Authenticated GET `/wallets/{wallet}/relay/operations?limit=20`: same HTTP 403/error 1010.

These are edge-denial responses, not `RelayErrorResponse` or service `ErrorResponse` fixtures. They establish neither relay eligibility nor token validity. No operation IDs or deployed contract addresses were retrieved. Credits were not requested because fee-enabled configuration could not be established; no POST, fresh read, authentication refresh or transaction was attempted. The response reports non-retryable access denial requiring site-owner action; no repeated retry or user-agent spoof was attempted.

Next retrieval step: the deployment owner enables access for this client, or the user supplies sanitized successful GET exports from an already authorized client. Then fetch config and list rows, use an actual returned operation ID for details, and read credits only if fee.enabled is true. The schema-derived examples remain static validation only; signed vectors and top-up recovery guarantees are still separate dependencies.

## Implemented API and policies — Phase 1

- `app/lib/apis/rwa/relay/relay.ts` implements config, submit, operation read, explicit Check now, cursor list, credits and top-up through `rwaApi`; `relay.schema.ts` and `relay.types.ts` own validation/types. Top-up is `/wallets/{wallet}/relay/fee/top-up` with exactly `{ publicKey, signature, amountUnits }`. It requires a caller-supplied valid signed permit; an authentication bearer token is not a permit signature.
- Config query options use the caller's API/network scope, one-minute freshness and no query retry. Loading is a distinct type; malformed, unavailable and 404 responses safely disable config. Paid config/credit responses need all consumed fields before use. Fee-off skips credit reads and refuses top-up without sending a request.
- `app/lib/relay/relay.errors.ts` preserves status, code, server message, remedy, structured detail, Retry-After and cache-bypass metadata without retaining Axios request credentials. Retry/re-sign functions are bounded policy decisions only. Mutations disable the shared Axios 401 replay using its existing `_retry` flag; after sign-in, the future lifecycle owner must recover/retry the exact stored payload and key. No mutation auto-retries. Unknown/malformed acceptance must remain locked and reconciled by that owner, not treated as proof of non-submission.
- `app/lib/relay/relay.eligibility.ts` checks authenticated-wallet equality and action-specific catalog capabilities; native balances never determine the payment mode. Cancel/refund do not require a token grant capability. Buy/sell require their quote/RWA operator capability.
- Submit schemas check exact string units, 1–10 cancels, zero native amount, one permit, entrypoint and destination agreement. They do not verify cryptographic signatures or the live Micheline action. The later permit builder must do that before submission. No providers or trade UI call these adapters yet; top-up recovery and signed-payload storage remain unimplemented.
- Ordinary acceptance has its own seed type, distinct from full operation rows. Top-up acceptance has no status field. Reads permit launchpad history/config values without enabling primary purchase relay execution. Read-only top-up intents remain free-form per the supplied schema.

Validation: 42 mocked/unit tests passed for schemas, endpoint/payload contracts, exact units, scope caching, fee-off suppression, malformed/offline config, cursor exhaustion, errors/retry limits and eligibility. Targeted ESLint passed. Repository typecheck failed in untouched files listed in `gas-plan.md`, with no reported errors in the new relay files. No live signing or POST was performed. The existing live evidence remains Cloudflare 403/error 1010. Do not describe this adapter layer as operational gasless trading until later integration and live checks pass.

## Implemented preference and direct safety — Phase 2

`GasPaymentProvider` is mounted inside UserProvider and above route/loading gates. It owns the active saved method and resolved network identity; Profile owns its draft. The initial server and hydration render is Credits, without browser storage access. Native balance never selects or saves the method.

Local persistence is authorized for this phase. The key is `gas-payment:` followed by the JSON tuple `[1, "basenet", rpcUrl, chainId, rwaApiUrl, walletAddress]`. The record is `{ version: 1, provenance: "explicit", method: "credits" | "mvrk" }`. Only valid explicit records restore. Legacy `mav`, unversioned, malformed or missing-provenance records are not migrated. Missing records default to Credits; corrupt/denied reads display a recoverable error. Unresolved network/wallet state cannot save or execute. This preference scope is not relay recovery storage.

Save writes localStorage before activating the method. A failed write preserves both the active method and the unsaved draft, with retry copy. Scope changes discard drafts; storage events restore the current scope across tabs. Name/email remain unsaved previews and the page says so. The header reuses CreditsWalletDropdown or MvrkWalletDropdown according to the saved method. Trade form keys and inputs do not depend on that method.

`useDirectOrderFee` exposes idle/loading/ready/error, scoped to exact serialized action arguments, method, wallet/network and validity. Edits invalidate readiness immediately and late estimates cannot replace newer state. It uses a narrow RPC balance read because UserProvider's fallback balances do not prove readiness. Errors and insufficient native funds block submission and expose retry. Direct mode makes no relay config, credits, submit or top-up request. **Credits execution remains unavailable until later phases**; the UI explains this and links to Profile without saving a fallback. Existing numeric Credits/top-up mock presentation is still Phase 6 work, not authoritative credit data.

`directOrderFee.ts` sums each Taquito batch estimate's `suggestedFeeMumav + burnFeeMumav`, plus any native transfer amount in mumav, using BigNumber. The installed Taquito batch estimator includes a leading reveal estimate when required; its `totalCost` instead uses the minimal fee and must not be used as suggested-fee affordability. Invalid/unsafe numeric values and incomplete estimate arrays fail closed. Network fee and storage cost are reviewed separately from the existing protocol-fee summary. Primary summaries are unchanged.

All four direct orderbook actions rebuild their existing batch, freshly estimate it and read the native balance before submission. The shared sender rechecks wallet and chain, then awaits the UI's current-action guard before sending that same batch. Cancel/refund now use reusable transfer builders for both estimation and execution; confirmation callbacks remain unchanged. UI refund actions additionally require `refund.status === "claimable"`. A saved method change cannot redirect an already submitted operation. Fee estimates are not a chain guarantee: wallet-adjusted fees or subsequent chain/balance changes can still cause wallet/RPC rejection.

Validation is mocked/unit and mounted jsdom testing; it is not live wallet, signing or relay verification. See `gas-plan.md` Phase 2 for exact counts, baseline failures and build results. Phase 0 signing/recovery dependencies and Cloudflare denial remain unchanged.

## Phase 3 — shared validation and signing evidence gate

`app/contracts/orderbookPayload.ts::buildOrderPayload` is the single exported raw order normalization/validation entry point. Direct buy and sell consume it; future verified permit builders must reuse it. It retains positive nat strings, trimmed currency, nullable expiry, market/limit price-tick differences, mandatory quantity alignment and downward-rounded quote minimum checks. It does not round submitted quantities or authorize trading by itself: existing config, KYC, balance and scope gates still apply. Direct grant/order/revoke semantics are unchanged.

No permit builder, signing prompt or pre-signing UI is enabled. The artifact audit found no deployed secondary scripts or public signing vectors. `primary.md` §6 contains a launchpad envelope/counter/hash example; it is partial documentation, not proof for the selected secondary contracts or wallet curves. The older `openapi.yaml` describes a three-field envelope; supplied `api.yaml` allows destination-schema-dependent deadlines. Neither HTTP intent nor authentication challenge encoding can define signed bytes. The API's edpk/sppk/p2pk description also needs wallet/contract vector verification.

The existing inline primary payment-token operator read is scoped to its launchpad. No shared secondary lookup was found. Verify secondary `is_operator` and fallback storage types before extracting a compatible helper; unreadable state must explicitly require a grant with diagnostics. No permit operator lookup or grant has been added. Live top-up collector/token identity and transfer encoding remain unverified.

To resume Phase 3, obtain pinned network/API/RPC and deployment identities, script/storage snapshots, exact action and counter schemas, full domain/deadline rules, packed action/hash/envelope/signature/transfer vectors per supported curve, and operator plus collector/token invariants from contract/API maintainers. See `gas-plan.md` Phase 3 for the full handoff and validation command. Then implement signing/scope checks, local verification, transfer construction and readable review before considering Phase 4.

Validation: 259 targeted deterministic unit/mocked/jsdom tests passed, including 11 new payload cases; targeted ESLint passed. Typecheck retains the seven documented baseline failing paths with no Phase 3 errors. No cryptographic or live verification is claimed; no valid permit vectors were available. Cloudflare 403/error 1010 evidence is unchanged.

## Live deployment evidence follow-up — 2026-10-22

Public config retrieval through curl now succeeds (HTTP 200); earlier Cloudflare 403/1010 captures remain historical. Python urllib still received HTTP 403. Authenticated history and credits reads with the subsequently supplied token returned HTTP 401 `unauthorized`. No POST was attempted.

[Deployment manifest](fixtures/permit-deployment/manifest.json) pins the configured Basenet RPC chain/block and hashes for three complete script/storage captures: one orderbook, one RWA token and the configured quote token. All three have deadline-bearing four-field permit items and an address-to-nat `getPermitCounter` view; token scripts also expose the owner/operator/token-ID `is_operator` view. These captures partially resolve the previously missing script/action/view evidence. They do not prove every catalog deployment, token/book linkage, signing behavior or signature vectors.

[Live relay config](fixtures/permit-deployment/relay-config.json) has relay/fees enabled and top-up bounds `5000000`–`100000000` raw units (six decimals). The supplied zero amount is outside those bounds. `api.yaml` documents `/relay/fee/top-up` with string `amountUnits`, whereas the supplied example used `/relay/top-up` and numeric zero. No amount was changed or submitted. Current config is runtime evidence, not a fixed UI tariff.

The supplied public key derives to the supplied wallet using the installed Mavryk utility. Its signature remains unverified: the original packed payload, signed counter/deadline and action context were not supplied. Credentials and the supplied signature are not stored in these fixtures. Obtain the original signing export and curve/hash behavior evidence, then complete the Phase 3 verification gates recorded in `gas-plan.md`.

A second, newly supplied access token also received HTTP 401 on both authenticated GETs while its nominal validity window covered the request. See [sanitized read results](fixtures/permit-deployment/authenticated-reads.json). Confirm the issuing API origin and server verification configuration; expiry alone does not explain the observed response. The supplied authentication signature is not a trading permit vector. Refresh-token rotation was not attempted.

## Phase 3 permit API and integration handoff

This section supersedes the earlier artifact/signing blockers for ordinary permits. `permitCodec.ts` owns action/domain encoding and signature verification. `permitGeneration.ts` admits only inspected executable generations; it is not a catalog/address override. Unknown code or orderbook lambdas fail before signing. Runtime config still supplies eligible contracts/actions. `orderbookPermit.ts` builds ordinary actions, validates exact quantities/cancel batches and reads operator state conservatively. `permit.ts` owns preparation/signing and exact transfer validation.

Supply `PermitRuntime` with the **existing** toolkit and Beacon client, a config refresh through the existing relay adapter, and a current scope callback. The scope contains connected/authenticated wallet, network, RPC URL, node chain ID, API URL and monotonic revision. Increment revision whenever wallet/network/auth state changes, including away-and-back transitions; do not retain an old closure. `preparePermit(runtime, request)` freezes the request and review, defaults to a 15-minute authorization window and reads contract state. It does not sign. `RPermitReview` displays it and invokes `signPreparedPermit` only after explicit acceptance. Key a replacement review by its payload. The callback returns signed data, not a completed transaction.

Before an initial ordinary POST, Phase 4 must call `assertPermitCurrent(runtime, signed.prepared)` and persist the exact request/idempotency key under the same scope. Do not serialize the whole toolkit or store the runtime/review component. After a possibly submitted attempt, recovery must retry its exact stored payload/key instead of rebuilding or re-signing. The permit module intentionally makes no submission and supplies no lifecycle success callback. Trade-route wiring remains Phase 5.

Signing verifies public-key-derived address, the active account, authenticated wallet, chain/RPC/API scope and revision around asynchronous steps. Re-preparation detects changed counters/config/actions before signing and after the response. Transfers have one exact envelope, zero native amount and matching destination; the encoded item must equal the reviewed action, signer, signature and deadline. Current book storage supplies quote token/ID, base address/decimals and tick/minimum validation. Captured sell lambda fingerprint plus token ID 0 establish the RWA spending invariant for this generation.

Operator lookup calls `is_operator` first, then the exact `(owner, operator, token_id)` map. Only a boolean view or Taquito `UnitValue` map entry establishes permission; undefined means absent. Unreadable state returns explicit diagnostics and `needsGrant: true`. Never cache a permanent grant assumption; direct batches can revoke it. Grants disclose persistent permission and are not limited to one order.

Six public generated vectors were accepted by live read-only `run_code` simulations of the captured quote-token and orderbook scripts, covering edpk/sppk/p2pk. They pin packed action, action hash, domain, signature and transfer parameters. They use discarded unfunded keys, not user credentials. See the fixture README for reproduction and limits. Numeric timestamp strings initially produced incompatible packing; use the implemented RFC3339 conversion. Pass raw packed domain bytes to Beacon and Taquito verification; the verifier performs the signing hash once.

Top-up construction/review exists but signing is disabled: the deployed token requires a deadline, while the top-up HTTP contract sends only publicKey/signature/amountUnits and does not specify deadline reconstruction. No deadline field, zero amount, token substitution or price conversion is invented. The API/contract owner must specify the exact reconstruction rule or versioned request change before enabling it. Correlation after an uncertain top-up POST and Credit denomination remain separate unresolved requirements.

Connected-wallet/relay end-to-end and desktop/mobile visual checks are deferred to the user after implementation phases, as requested. This is not a claim that production Credits execution is enabled. The ready-to-copy continuation request is `docs/phase-4-request.md`.

Phase 3 final validation: 317 tests across 13 suites passed, targeted ESLint passed, and the direct Remix client/SSR/PWA build passed. Typecheck still fails only in the seven documented baseline paths. No commit or deployment was made.


## Phase 4 — durable relay lifecycle and recovery

`RelayProvider` is mounted once inside the existing wallet/auth/query/notifier providers, above route/loading gates. `RRelayProgress` is a persistent inline details/minimize surface and does not require PopupProvider; closing a trade popup cannot stop tracking. Bridge providers, settlement/signers and primary purchases retain their ownership. The direct secondary sender only adds a stored relay-slot guard; its public APIs and grant/order/revoke batches are unchanged.

`useRelay()` exposes the existing-client-backed `runtime`, `submit(signed)`, `isReady`, `isLocked(contract)`, recovery records and lifecycle details/check/retry actions. Phase 5 must check readiness/locks before signing and use this submit boundary, not the HTTP adapter directly. Initial submit calls `assertPermitCurrent` on the reviewed permit. Runtime config refresh uses the existing adapter. `relay.scope.ts` records synchronous wallet/network and authentication transitions, including away-and-back events inside a batched React render; late reads/posts/events from an old revision are rejected. Recovery retries intentionally do not rebuild/re-sign/revalidate a possibly consumed permit: they resend its exact stored request/key under the original wallet/network/API scope.

Storage keys are `relay-attempt:` plus the existing versioned `[1, "basenet", rpcUrl, chainId, rwaApiUrl, wallet]` tuple, then the attempt ID. Each independently validated record is capped at 128,000 characters and stores version, scope, frozen method (`credits`), normalized intent identity, destination, creation time, idempotency key, exact signed ordinary request, POST count/backoff, recovery state, operation ID, last merged row snapshot and presentation flags. Per-attempt keys avoid replacing another tab's entire collection. No JWT, login signature, private key, toolkit or wallet client is stored. The signed request is a sensitive authorization needed for exact recovery; it is removed on authoritative terminal settlement or a conclusive first 400/402/403/404/422 refusal. Unknown records have no timeout-based deletion. Settled metadata and once-only notification markers remain for reload suppression; storage pressure fails closed rather than pruning unresolved work.

A storage write/read-back must succeed before POST. Storage failure after submission leaves the previously saved unknown marker and an in-memory lock; the UI asks the user to keep the page open and restore storage. Invalid/denied recovery storage blocks new actions. The shared direct orderbook sender checks the same persisted contract slots immediately before wallet submission, regardless of saved payment method. Browser storage deletion outside the app cannot provide durable recovery guarantees; server-side in-flight locking remains authoritative across tabs/devices.

A 202 seeds only a partial React Query row using **our** operation ID and local intent. Even a terminal replay acceptance requires its full GET before settlement/notification. GET and validated known-wallet socket frames share an updatedAt merge: old/equal progress cannot overwrite newer fields, missing metadata can be filled by GET, and later terminal fee amendments remain mergeable. Frames for unknown operation IDs or another wallet are ignored; event IDs are bounded/deduplicated. React Query owns the live rows; record row snapshots support reload restoration. Full rows that disagree with the saved action remain locked.

Polling is three seconds, thirty only while the existing notifier is connected/authenticated for the current wallet. Reconnect, trade/portfolio entry and restoration reconcile all open cursor pages; uncertain ID-less attempts use status-independent cursor reconciliation. Repeated cursors fail visibly. Unknown intent matches in history are not proof of identity or absence; exact-key replay is the ordinary recovery mechanism. A 409 is fetched and compared by full intent and contract before adoption. Unrelated work is tracked/locked separately and never returned as completion of the requested action.

Retries are explicit, with the existing 1/2/4-second minimum delays, longer Retry-After respected, and at most four total POST attempts persisted across reload. Transport loss/malformed acknowledgment is unknown. A 401 retains the exact payload for sign-in recovery. Later refusals cannot erase an earlier unknown outcome. Exhausted/ambiguous attempts stay locked with Check now/details; they never silently switch to MVRK or request another signature. Re-sign/remedy-specific trade flows belong to Phase 5. No sequential plan or remaining signature is resumed on reload.

Progress says Still processing after ten minutes. Details exist without a hash; Nexus links appear only for an actual opHash. Minimize/dismiss flags persist, with dismiss allowed only after settlement. Confirmed messages distinguish operator setup, top-up, placement, cancellation and refund; order placement does not mean fill. Settled null fees say “No service fee retained”; positive fees show exact raw quote-token units, without invented Credits conversion.

Terminal outcomes and fee amendments invalidate scoped credits/relay lists. Confirmed order actions invalidate open orders, order history and activity summary using existing freshness helpers without inventing a confirmation level. Confirmed operations request authoritative account/token-balance refresh through UserProvider and invalidate relevant query data. No balance is incremented locally. Durable notification markers are written before terminal toasts; the generic socket toast listener skips relay events so the lifecycle owner is the sole relay toast source. Backend-authored inbox rows remain unchanged; inbox templates/history integration are Phase 7.

Known pending top-ups recovered from the API occupy the same token slot as operator grants. There is deliberately no lifecycle top-up submission entry point, guessed deadline, extra HTTP field, or inferred lost-top-up correlation. The Phase 3 signing guard remains unchanged. An empty open list does not release an uncertain ordinary marker and cannot establish top-up non-submission.

Validation and limitations: see Phase 4 in `gas-plan.md` for commands/results. Tests use fake timers, mocked API responses and mounted jsdom providers; no successful authenticated relay POST, connected-wallet signing, end-to-end execution or desktop/mobile visual approval is claimed. The user will perform connected-wallet/end-to-end testing after all phases. Continue with `docs/phase-5-request.md`.
