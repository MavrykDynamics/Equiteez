**Service:** Mavryk Bridge ETH Backend
**Runtime release:** v0.0.6
**API schema version:** 0.1.0; URL prefix `/v1`**Protocol:** HTTP REST + JSON; asynchronous processing with client polling

---

## Table of contents

1. Overview
2. Authorization
3. Common conventions
4. Endpoints
   - 4.1 Service and schema
   - 4.2 Approved routes
   - 4.2a Asset metadata and quote previews
   - 4.3 Create an operation
   - 4.4 Read an operation
   - 4.5 Register a Basenet funding transaction
5. Errors
6. Data structures and state interpretation
7. Frontend integration recommendations
   - 7.1 Connected-wallet Basenet walkthrough
8. Architecture, security and recovery
9. Deployment, monitoring and production readiness

---

## Release scope

The service coordinates a 1Click swap whose output is delivered to an EVM WrapForwarder, sponsors forwarding into WrapBridge, and independently verifies mint execution on Mavryk. Both Bridge UI and Equiteez use the same API contract. This is a separate backend codebase deployed alongside the corresponding bridge in its existing Helm chart and namespace.

In v0.0.6, Equiteez and Bridge UI can run a connected-wallet transfer on Arbitrum Sepolia → Mavryk Basenet. The rehearsal adapter supplies the quote and uses the registered transaction hash for provider status. The ERC-20 transfer, sponsored forward, bridge signatures and FA2 mint run on their respective test networks.

OpenAPI version `0.1.0` uses the URL prefix `/v1`. Readiness requires PostgreSQL migration `013-connected-basenet` and the required pg-boss queues.

## 1. Overview

### Responsibilities

| Participant                     | Responsibility                                                                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend / source wallet        | Select a route and amount, retain a random operation capability, create the operation, fund the published source deposit, and display progress.                  |
| Backend API                     | Validate requests and route policy; atomically save the operation and its first job; return durable instructions and public progress projections.                |
| Quote / swap worker             | Verify the deterministic forwarder, request and persist an executable quote, poll 1Click, and verify actual EVM token receipts.                                  |
| Sponsor relayer                 | Persist a transaction/nonce/budget journal, call `WrapForwarderFactory.forward(recipient, token)`, and pay EVM forwarding gas from the dedicated sponsor wallet. |
| Forwarder factory and forwarder | Deploy the deterministic forwarder if needed and call WrapBridge with the eligible token balance.                                                                |
| WrapBridge                      | Execute the wrap and emit `ERC20WrapAsked`.                                                                                                                      |
| Existing Bridge Signers         | Verify bridge events and submit Mavryk mint votes under the bridge protocol.                                                                                     |
| Mint worker                     | Verify canonical applied Mavryk mint execution and project settlement back into the operation. It holds no Mavryk signing key.                                   |

The user does not call the factory or pay forwarding gas on the bridge's EVM chain. Receiving the minted tokens requires no frontend claim transaction or additional user gas payment. Source funding and swap economics are separate: the frontend must display the actual wallet transaction and quote, not promise a globally fee-free transfer.

### Environments

| Environment        | API / behavior                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Basenet deployment | `https://basenet.bridge-api.mavryk.network`; public routes depend on operator activation.                                                                                                           |
| Local development  | Usually `http://127.0.0.1:8080`; local fixture routes are not live deployment instructions.                                                                                                         |
| Mainnet            | Requires approved real 1Click assets, verified/pinned deployments, explicit route activation, funded sponsor and production release checks. No mainnet API deployment is asserted by this document. |

On the connected-wallet route, each operation binds its own EVM sender and Basenet recipient. The worker verifies the deterministic forwarder for that recipient before publishing funding instructions. A single schema-2 installation serves multiple wallets. The older schema-1 rehearsal retains its pre-approved wallets and operator hash registration for existing runs. In real 1Click mode the published funding address is the provider’s source-chain deposit address.

### Supported integration boundary

The current public funding contract accepts EVM source/refund addresses and an `mv1` destination. Routes are provisioned server-side. Clients cannot supply arbitrary factories, RPC URLs, token contracts or finality policies. The current settlement policy accepts approved 6- or 18-decimal ERC-20s with six-decimal destination FA2 accounting. It is not a generic interface for every network supported by 1Click.

Discovery exposes approved route and asset metadata. Real 1Click routes can offer an indicative quote when preview is enabled. Create an executable operation only after the user accepts the terms. Clients track operations individually by polling.

## 2. Authorization

### Operation capability

`POST /v1/operations`, `GET /v1/operations/{id}` and the Basenet `POST /v1/operations/{id}/deposit` require:

```
Authorization: Bearer <operation-capability>
```

The client generates **32 cryptographically random bytes**, encoded as canonical base64url without `=` padding: 43 characters. This is not a user login JWT, RWA access token, wallet signature, NEAR Partner JWT or 1Click API key.

```jsx
function newOperationCapability() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
```

Persist the capability, idempotency key and exact request **before** the first POST. Keep the capability in secure application-managed storage, outside URLs, analytics, logs and error-report payloads. Use HTTPS outside local development. A capability authorizes access to its operation scope; it does not authenticate ownership of either wallet. Generate a separate capability for each new transfer intent to limit exposure.

Only SHA-256 of the decoded capability bytes is stored server-side. There is no capability recovery, rotation or wallet-login recovery endpoint. Losing it loses access to the operation API, even if the wallet address is known. The operation ID alone is not sufficient. Invalid/missing capabilities and operations belonging to another capability return 404 rather than exposing ownership.

### Idempotency

Creation also requires:

```
Idempotency-Key: <8–128 visible ASCII characters without whitespace>
```

`crypto.randomUUID()` is suitable. The uniqueness scope is `(capability hash, Idempotency-Key)`.

- Same scope and same normalized request: return the existing operation with `202` and `Idempotency-Replayed: true`; no additional create job.
- Same scope with a changed request: `409 IDEMPOTENCY_CONFLICT`.
- Same key with a different capability: a separate scope, not recovery of the earlier request.
- A timeout, dropped connection or `503` can occur after commit. Retry the original capability, key and body; never generate a new key just because the response was lost.
- Existing admissions remain replayable after route pause. Recovery mode overrides normal creation/replay admission and suppresses funding; use the operation GET while recovery is active.

The real 1Click worker and the optional real quote-preview service use a server-side provider credential. Connected-wallet Basenet uses its configured Sepolia RPC. Operator commands use separate PostgreSQL credentials.

## 3. Common conventions

| Convention      | Contract                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content type    | `application/json` for POST.                                                                                                                                                                  |
| Amounts         | Canonical base-unit decimal **strings**, bounded by uint256. Inputs are positive; balances and accounting projections can be `"0"`.                                                           |
| Invalid amounts | JSON numbers, fractional notation, exponent notation, signs, whitespace and leading zeroes are rejected.                                                                                      |
| Decimals        | `amountIn` and funding `amount` use the source asset's decimals. Quote output, delivery and forwarding use settlement ERC-20 decimals. Settlement/mint amounts use FA2 decimals, currently 6. |
| Addresses       | Nonzero EVM addresses; mixed-case must have valid checksum, then normalize to lowercase. Recipient must be valid canonical `mv1` Base58Check.                                                 |
| Chain IDs       | Strings, including `"421614"`; Mavryk chain ID appears separately in settlement.                                                                                                              |
| Slippage        | Integer basis points; 100 bps = 1%; input 0–9999, further restricted by the route.                                                                                                            |
| Dates           | UTC ISO/RFC3339 strings. Nullable dates mean no observation/schedule available.                                                                                                               |
| Unknown input   | Unknown body fields and unexpected query parameters are rejected on typed business endpoints.                                                                                                 |
| Cache           | API responses use `Cache-Control: no-store`; do not CDN-cache operation responses.                                                                                                            |
| Body size       | 16 KiB; oversized requests return 413.                                                                                                                                                        |
| Polling         | Use `retryAfterMs` from the operation, with jitter/backoff on errors. `nextCheckAt` is an internal scheduled check, not an ETA guarantee.                                                     |
| Revisions       | Version of the stored operation row. Other projected evidence can change independently; do not use `revision` alone to suppress UI updates.                                                   |

**18-decimal precision example:** a verified receipt of `"1000000000000000001"` contains 1 token plus one smallest ERC-20 unit. Its bridgeable amount is `"1000000000000000000"` and its dust amount is `"1"`. The corresponding mint is `"1000000"` six-decimal FA2 units. The backend preserves the complete receipt and never silently lowers the user's accepted minimum to accommodate rounding.

`bridgeableAmountOut` and `bridgeableMinAmountOut` remain ERC-20 base-unit strings even after rounding. They are not already converted to FA2 units. Use bigint/string arithmetic in both frontends; never `Number`, `parseFloat` or floating-point multiplication for transaction amounts.

## 4. Endpoints

### 4.1 Service and schema

| Method and path           | Authorization | Result                                                                                                 | Exposure                           |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `GET /docs`, `GET /docs/` | None          | Interactive Swagger UI, with all assets served from the same API origin.                               | Public.                            |
| `GET /healthz`            | None          | `200 {"status":"ok"}` for process liveness.                                                            | Internal; no public Gateway route. |
| `GET /readyz`             | None          | 200 when required migrations, tables and queues are available; otherwise `503 DEPENDENCY_UNAVAILABLE`. | Internal; no public Gateway route. |

Open `/docs` for the interactive reference. Its generated OpenAPI schema is embedded in the page; there is no separate `/openapi.json` endpoint in the new version. The UI does not persist capabilities across reloads, load scripts from a CDN, contact an external validator or execute operations on page load. Use Authorize to supply an operation capability for an explicitly initiated request; no 1Click/Partner token belongs in this UI.

Prometheus uses a separate private listener on port 9090. `/metrics` is not registered on the public API listener. Process readiness is not a guarantee of route activation, a funded sponsor, successful 1Click execution, signer liveness, or destination minting.

### 4.2 Approved routes

```
GET /v1/routes
```

No capability required. Returns `200 {"routes":[...]}` with enabled route versions. An empty array means no currently exposed approved route; disable new transfer initiation in the UI. It is not a network error. Recovery mode does not remove routes from this list: creation is rejected and GET hides funding instructions. A listed route is not proof that recovery is inactive.

| Route field                            | Meaning                                                             |
| -------------------------------------- | ------------------------------------------------------------------- |
| `id`, `version`, `enabled`             | Immutable route identity/version and current availability.          |
| `sourceChainId`, `settlementChainId`   | Source EVM chain and EVM chain hosting the bridge.                  |
| `originAsset`, `destinationAsset`      | Provider asset identifiers; do not derive them from ticker symbols. |
| `settlementToken`                      | Approved ERC-20 on the settlement chain.                            |
| `factoryAddress`, `bridgeAddress`      | Approved WrapForwarderFactory and WrapBridge.                       |
| `sourceDecimals`, `settlementDecimals` | Unit conversion for the approved assets.                            |
| `minAmountIn`, `maxAmountIn`           | Inclusive source-unit admission bounds.                             |
| `minAmountOut`                         | Minimum accepted output in settlement ERC-20 units.                 |
| `maxSlippageBps`                       | Maximum permitted slippage.                                         |

Finality policy, internal deployment pins and provider credentials are not returned. Route availability is rechecked at admission/publication: a route can be paused after the list was fetched. The list remains the technical route contract. Use the optional `GET /v1/metadata` for asset identities and `POST /v1/quotes/preview` for an indicative quote. Neither activates a route or creates a payment.

### 4.2a Asset metadata and quote previews

Discovery and indicative quotes are independently configurable, with metadata required for preview. Additional examples are available in the discovery guide.

`GET /v1/metadata` has no parameters or capability. It returns `{schemaVersion:1, admissionPaused, routes:[...]}` with enabled route versions, source/settlement asset IDs, chain IDs, kind, contract, symbol and decimals; destination chain/FA2/tokenId/decimals; limits; mode and `previewSupported`. The public metadata envelope uses `schemaVersion: 1`. The internal Basenet installation uses `schemaVersion: 2`. Clients detect connected-wallet support by checking the route’s optional `depositRegistrationSupported` field for literal `true`. A missing flag disables that flow. No metadata means no inferred asset. Basenet rehearsal is explicitly marked and cannot use real 1Click preview.

`POST /v1/quotes/preview` has the same seven input fields as operation creation, excluding `acceptedMinAmountOut`. It requires no capability or idempotency key. The backend fixes `dry:true`, validates the signed response and returns `kind:"indicative", executable:false`, amounts, rounded bridgeable amounts, six-decimal destination amounts, freshness and optional provider fee/time estimates. It does not expose a deposit address or create operations, quotes, jobs or sponsor reservations. Route revisions and recovery are checked again after external work.

After user confirmation, submit a normal operation with an explicit accepted minimum in settlement units (typically the displayed `bridgeableMinAmountOut`). The worker requests a separate `dry:false` quote and independently enforces the accepted minimum after rounding. A preview is not a guaranteed rate, funding deadline or permission to send tokens. The frontend never passes `dry` to any backend route; `/v1/routes?dry=true` is invalid.

### 4.3 Create an operation

```
POST /v1/operations
Authorization: Bearer <saved-capability>
Idempotency-Key: <saved-key>
Content-Type: application/json
```

Every field is required:

```json
{
  "routeId": "local-fixture",
  "routeVersion": 1,
  "sourceAddress": "0x1111111111111111111111111111111111111111",
  "recipient": "mv1SdUcjN7zi2ekSwfeTibi83HkVbUnWC1AM",
  "refundAddress": "0x2222222222222222222222222222222222222222",
  "amountIn": "10000000",
  "slippageBps": 50,
  "acceptedMinAmountOut": "1000000"
}
```

This is a structural local-fixture example, **not** an executable Basenet/mainnet request. Select a live enabled route and the user's actual wallets. Section 7.1 gives the exact request for the connected-wallet Basenet route.

`routeId`: 1–128 characters, first alphanumeric, followed by alphanumeric/underscore/dot/colon/hyphen. `routeVersion`: positive integer up to 2147483647. `sourceAddress` identifies the funding wallet; `refundAddress` is the provider refund destination on the source chain. `acceptedMinAmountOut` is the user's explicitly accepted lower bound in settlement ERC-20 units, subject to route limits and destination precision. It is not automatically a quote or an FA2 amount.

Successful creation or replay returns **202** with the full Operation object, not a job ID wrapper:

```
Location: /v1/operations/<operation-uuid>
Idempotency-Replayed: false
Cache-Control: no-store
```

The ordinary initial state is `PREPARING_QUOTE`, `fundingStatus: NOT_READY`, `fundingInstructions: null`. The first response is a fresh projection after commit, so a fast worker or replay may already show a later state. A 202 means the operation is durable; it does not mean a quote exists or funds moved. Save the returned ID and poll GET. The frontend must wait for `fundingStatus: AVAILABLE` and non-null instructions before enabling funding.

### 4.4 Read an operation

```
GET /v1/operations/<operation-uuid>
Authorization: Bearer <same-saved-capability>
```

Returns 200 with the Operation object. No idempotency header or query parameters are needed. Unknown/foreign operations return 404. This endpoint is read-only: polling never signs or sends a transaction and does not create a replacement quote.

There is no list-by-wallet endpoint. Each frontend must retain its own operation IDs and capabilities. A user switching between Bridge UI and Equiteez does not automatically share this local history.

### 4.5 Register a Basenet funding transaction

After the source wallet returns a transaction hash, persist it with the operation ID. Use the same operation capability used at creation. This endpoint is enabled for connected-wallet rehearsal outside recovery mode. The request body contains only the hash. Registration is idempotent without an `Idempotency-Key` header.

```
POST /v1/operations/{id}/deposit
Authorization: Bearer <saved-capability>
Content-Type: application/json

{"transactionHash":"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}
```

Example first response, HTTP 200:

```json
{
  "operationId": "e770b30e-23cb-43f5-8174-65dc81ef617e",
  "transactionHash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "replayed": false
}
```

The API verifies the successful canonical Sepolia receipt against the published quote, including confirmations, token, sender, forwarder, exact amount and funding window. It stores the normalized hash in PostgreSQL. A repeat for the same operation and hash returns 200 with `replayed: true`, including after a lost response. A conflicting binding returns 409. An accepted registration lets the worker independently verify delivery. Keep polling the operation through settlement.

## 5. Errors

```json
{
  "error": {
    "code": "IDEMPOTENCY_CONFLICT",
    "message": "Human-readable explanation",
    "requestId": "server-generated-request-uuid"
  }
}
```

Branch on `code` and HTTP status, not the message text. Keep `requestId` for support. Database/provider exception details and secrets are not part of the response.

| HTTP / code                                                       | Client action                                                                                                                                        |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400 `VALIDATION_ERROR`                                            | Fix shape, address, key or integer encoding before retrying.                                                                                         |
| 400 `AMOUNT_OUT_OF_RANGE`                                         | Respect the selected route's source amount bounds.                                                                                                   |
| 400 `SLIPPAGE_OUT_OF_RANGE`                                       | Respect the route's maximum slippage.                                                                                                                |
| 400 `MIN_OUTPUT_TOO_LOW`                                          | Accepted output is below route policy; obtain explicit user acceptance of valid parameters.                                                          |
| 404 `NOT_FOUND` / `OPERATION_NOT_FOUND`                           | Invalid/missing capability, unknown operation or foreign scope. Recover locally saved credentials; do not enumerate wallet addresses.                |
| 409 `IDEMPOTENCY_CONFLICT`                                        | The key already binds another request. Recover the original operation; a deliberate new intent needs its own capability/key.                         |
| 409 `ROUTE_UNAVAILABLE`                                           | Refresh routes; do not silently substitute another route. Existing operations remain readable.                                                       |
| 413 `PAYLOAD_TOO_LARGE`                                           | Reduce the request; maximum body is 16 KiB.                                                                                                          |
| 415 `UNSUPPORTED_MEDIA_TYPE`                                      | Send JSON with the correct content type.                                                                                                             |
| 429 `RATE_LIMITED`                                                | Respect `Retry-After` when supplied, add jitter and reduce polling.                                                                                  |
| 500 `INTERNAL_ERROR`                                              | Retain request ID, back off; creation retries preserve the exact idempotency scope.                                                                  |
| 503 `DEPENDENCY_UNAVAILABLE`                                      | Database/queue/readiness failure or intentional recovery admission pause. Back off, keep the same scope, and use GET to track an existing operation. |
| 409 `REHEARSAL_SCOPE_MISMATCH`                                    | Check route ID/version, sender/refund equality, exact amounts and zero slippage. Legacy runs also require their assigned scope.                      |
| 409 `REHEARSAL_QUOTE_NOT_PUBLISHED`                               | Poll the operation for published funding instructions before prompting the wallet.                                                                   |
| 409 `REHEARSAL_RECEIPT_PENDING`                                   | Receipt or confirmations pending. Retry registration with the saved hash after 10–30 seconds, with backoff.                                          |
| 409 `REHEARSAL_DELIVERY_MISMATCH` / `REHEARSAL_DELIVERY_CONFLICT` | Stop registration retries. Preserve the operation ID and hash for investigation.                                                                     |
| 503 `REHEARSAL_RPC_UNAVAILABLE`                                   | Retry the same registration with backoff. A 429 or lost response also uses the same hash.                                                            |

Asynchronous quote rejection, provider unavailability, delivery ambiguity and mint incidents generally arrive in the Operation state, not as a synchronous HTTP error. Keep an unknown-code/state fallback that preserves the operation and stops funding when interpretation is uncertain.

## 6. Data structures and state interpretation

### Operation

The object includes all eight immutable request fields plus:

| Field                          | Type / meaning                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `id`                           | Operation UUID.                                                                                     |
| `phase`                        | Last projected EVM workflow phase, listed below.                                                    |
| `attention`                    | Overlay describing retries, policy pauses or an investigation.                                      |
| `closure`                      | `OPEN` or `QUOTE_REJECTED`; `OPEN` is not a settlement result.                                      |
| `revision`                     | Stored operation revision, integer ≥ 1.                                                             |
| `fundingStatus`                | Whether the original full deposit instructions can still be used.                                   |
| `fundingInstructions`          | Funding object or null.                                                                             |
| `providerStatus`               | Provider report or null; never independent chain proof.                                             |
| `delivery`                     | Verified ERC-20 delivery projection.                                                                |
| `forwarding`                   | EVM forwarding/wrap projection.                                                                     |
| `settlement`                   | Destination mint evidence and status.                                                               |
| `refund`                       | Provider-reported refund or null.                                                                   |
| `createdAt`, `updatedAt`       | UTC timestamps.                                                                                     |
| `lastCheckedAt`, `nextCheckAt` | Nullable swap-observation/check timestamps; not universal timestamps for every mint/relayer action. |
| `retryAfterMs`                 | Suggested interval before the next GET.                                                             |

### Phases and completion

| Phase                | Display interpretation                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `PREPARING_QUOTE`    | Preparing and validating the executable quote.                                                             |
| `AWAITING_DEPOSIT`   | Quote published; independently check funding availability/expiry.                                          |
| `SWAP_IN_PROGRESS`   | Funding/provider activity observed.                                                                        |
| `VERIFYING_DELIVERY` | Checking actual receipt evidence and finality on the EVM bridge chain.                                     |
| `DELIVERY_VERIFIED`  | Historical receipt attributed to the operation; not proof of current free balance or completed forwarding. |
| `FORWARDING`         | Sponsored forwarding is in progress.                                                                       |
| `WRAPPED`            | Verified EVM wrap evidence; **not** Mavryk mint completion.                                                |

There is no `COMPLETED` phase. Show confirmed destination receipt when `settlement.status === "CONFIRMED"`, with the verified destination asset and amount. Preserve any concurrent reconciliation/review warning. `WRAPPED` with `PENDING` means “Waiting for Mavryk confirmation”; `WRAPPED` with `NOT_TRACKED` means this service has not established destination settlement. Existing Bridge Signers and mint observation operate asynchronously; the user's tokens appear in their Mavryk/Equiteez balance without a frontend claim step.

`attention` values: `NONE`, `RETRYING`, `ROUTE_PAUSED`, `MANUAL_REVIEW`, `PROVIDER_UNAVAILABLE`, `DEPOSIT_INCOMPLETE`, `REFUND_PENDING`, `RECONCILE_REQUIRED`. These are overlays, not success/failure finality. `MANUAL_REVIEW` and `RECONCILE_REQUIRED` require investigation; do not encourage a second deposit or automatic resubmission.

`QUOTE_REJECTED` closes quote preparation before publication. Expiry of an already published quote is different: instructions are hidden, but the same deposit address is never automatically replaced and late funds still require reconciliation.

### Funding

| Status      | UI action                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| `NOT_READY` | Wait; no funding action.                                                                                       |
| `AVAILABLE` | Instructions are currently usable. Verify network, asset, amount, address and expiry before wallet submission. |
| `EXPIRED`   | Disable funding; do not reuse cached instructions.                                                             |
| `PAUSED`    | Route/recovery/review safety gate; disable funding.                                                            |
| `OBSERVED`  | Funding activity already observed; hide the original full-amount send action.                                  |

The nullable `fundingInstructions` object contains:

| Field                                           | Meaning                                                                                                                                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `quoteId`                                       | Persisted executable quote UUID.                                                                                                             |
| `sourceChainId`, `originAsset`                  | Source network and provider asset being deposited.                                                                                           |
| `depositAddress`, `depositMemo`                 | Actual funding destination; memo is null in this release.                                                                                    |
| `amount`                                        | Exact source base units to fund.                                                                                                             |
| `amountOut`, `minAmountOut`                     | Quoted output and minimum in settlement ERC-20 units.                                                                                        |
| `bridgeableAmountOut`, `bridgeableMinAmountOut` | Values rounded down to destination-representable precision, still in ERC-20 units.                                                           |
| `deadline`                                      | Provider quote deadline.                                                                                                                     |
| `fundingExpiresAt`                              | Earlier UI funding cut-off; defaults to deadline minus a 60-second safety margin.                                                            |
| `forwarderAddress`                              | Predetermined settlement-chain recipient of 1Click's output. The backend verifies it; the frontend needs no separate address-discovery step. |

Once published, instructions are immutable. The response exposes them only while safe. Persisted historical instructions must not be treated as current permission to send. The API does not supply an approval transaction or wallet SDK implementation: the frontend builds the source-asset funding transfer using its supported wallet integration.

### Provider report, delivery and refund

Provider status values are `PENDING_DEPOSIT`, `KNOWN_DEPOSIT_TX`, `INCOMPLETE_DEPOSIT`, `PROCESSING`, `SUCCESS`, `REFUNDED`, and `FAILED`. `SUCCESS` does not prove the delivery receipt or the mint. The worker verifies successful canonical ERC-20 logs, exact token/account attribution and the route's confirmation/finality policy independently.

`delivery` contains `status` (`NOT_OBSERVED`, `VERIFYING`, `VERIFIED`, `AMBIGUOUS`, `RECONCILE_REQUIRED`), nullable `expectedAmount`, `confirmedAmount`, `transferCount`, and `transactionHashes`. Amounts use settlement ERC-20 units. Ambiguous/shared/unmatched inventory is never guessed into a user's operation.

`refund`, when present, is `{status: "REPORTED", amount, asset, recipient}`. It is a provider report, **not independently verified on-chain refund completion**. The service does not execute a refund or provide a refund claim endpoint.

### Forwarding

`forwarding.status`: `NOT_READY`, `READY`, `IN_PROGRESS`, `RECONCILE_REQUIRED`, `WRAPPED`.

| Field              | Meaning                                                                               |
| ------------------ | ------------------------------------------------------------------------------------- |
| `transactionHash`  | Nullable associated sponsored transaction hash.                                       |
| `wrappedAmount`    | Attributed amount already wrapped, in ERC-20 units.                                   |
| `bridgeableAmount` | Verified delivery representable in destination precision.                             |
| `remainingAmount`  | Operation-owned units still held at the forwarder.                                    |
| `dustAmount`       | Sub-FA2-unit delivery remainder; it may remain or contribute to a later pooled sweep. |
| `bridgeEvents`     | Array of `{transactionHash, logIndex, amount}` for attributed EVM wraps.              |

Forwarders are deterministic/shared for their configured recipient context; an arbitrary balance is not automatically this operation's deposit. Third parties can call the factory. The backend observes resulting movement without double-counting custody or releasing an unresolved signed sponsor transaction prematurely.

### Settlement

`settlement.status`: `NOT_TRACKED`, `PENDING`, `CONFIRMED`, `RECONCILE_REQUIRED`.

| Field                                      | Meaning                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `confirmedAmount`                          | Confirmed destination FA2 base units; six decimals for approved current pairings. |
| `tokenAddress`, `tokenId`, `mavrykChainId` | Nullable verified destination asset identity. A ticker alone is insufficient.     |
| `mints`                                    | Evidence array described below; may contain multiple allocations.                 |

Each mint contains `wrapTransactionHash`, `wrapLogIndex`, `operationHash`, `blockHash`, `level`, and `amount`. Verification binds the applied canonical receipt, executed mint request, recipient, asset, amount and pinned minter/token code to the corresponding EVM wrap. An indexer status, one `signMint` vote or a wallet balance change alone is insufficient. The API can remain at `phase: WRAPPED` after settlement becomes confirmed.

## 7. Frontend integration recommendations

1. Load enabled routes and approved display metadata. Check the user's source network and `mv1` recipient. Obtain explicit acceptance of the amount, slippage and minimum output.
2. Generate and persist one random capability, one idempotency key and the immutable request. POST once; retries reuse all three.
3. Persist the operation ID and poll GET. Render phases and attention states separately. Follow `retryAfterMs`; back off with jitter on rate limits/network failures.
4. Enable source funding only with fresh `AVAILABLE` instructions. Re-read before asking the wallet to sign; validate the chain, asset, exact amount and cut-off. In real 1Click mode send to `depositAddress`, not `forwarderAddress`.
5. After wallet submission, disable duplicate funding locally immediately. Persist the source transaction hash. When the route advertises connected-wallet registration, submit it as described in section 4.5. In real 1Click mode the provider reports swap status. A lost wallet response must be resolved with the wallet/chain before offering a second send.
6. Continue polling after reload using the saved capability. Once funding is observed, do not show the original full-deposit button, including for incomplete deposits. This release does not publish safe automatic top-up instructions.
7. Show EVM delivery, sponsored forwarding and Mavryk settlement as separate asynchronous stages. The backend sponsor pays forwarding gas; the frontend submits no bridge-chain factory transaction or Mavryk claim.
8. Show received tokens only when destination evidence is confirmed; refresh the actual Equiteez/Bridge UI balance source independently. Never equate job completion, 1Click SUCCESS, WRAPPED or a signer vote with final receipt.
9. For review/reconciliation, preserve the operation and show support context using operation ID/request ID. Exclude capabilities and keys from support logs or analytics.
10. Prevent accidental new intents after an expired/pending transfer. A deliberately new operation needs a fresh capability/key and valid route; a published old address must not be silently replaced or reused as a new quote.

### 7.1 Connected-wallet Basenet walkthrough

1. Fetch `GET /v1/metadata`. Select enabled route `basenet-rehearsal-k8s` from the current catalog. Require `admissionPaused: false` and `depositRegistrationSupported: true`. This route advertises `mode: "rehearsal"` and `previewSupported: false`. Use the returned source asset for the selector and wallet balance. Its asset ID is `basenet-rehearsal:0x5c05e82be66b19476bacb558e62e7d449b98635f`, on Arbitrum Sepolia (`421614`, 18 decimals). The sender needs 1 mock USDT plus Sepolia ETH for the source transfer.
2. Generate a fresh capability and idempotency key as described in section 2. Persist them with the exact body. Set both EVM address fields to the connected sender and `recipient` to the selected Basenet account. The following JavaScript constructs the JSON body for `POST /v1/operations` using those wallet values and the route returned by metadata.

```jsx
const request = {
  routeId: route.routeId,
  routeVersion: route.routeVersion,
  sourceAddress: connectedEvmAddress,
  refundAddress: connectedEvmAddress,
  recipient: connectedBasenetAddress,
  amountIn: "1000000000000000000",
  slippageBps: 0,
  acceptedMinAmountOut: "1000000000000000000",
};
```

1. Save the ID from the 202 response and poll `GET /v1/operations/{id}` with the saved bearer. Wait for `fundingStatus: AVAILABLE`. Recheck the connected wallet, chain, token, amount and expiry. Submit one ERC-20 `transfer` to `fundingInstructions.depositAddress`, the verified forwarder for this recipient. Funding windows for the same deterministic address cannot overlap.
2. Save the wallet’s transaction hash immediately and register it using section 4.5. After a reload or timeout, resume with the saved operation and hash. A pending receipt prompts another HTTP request, never another wallet transfer.
3. Follow delivery verification, sponsored forwarding and Mavryk settlement through the operation GET. Display receipt when `settlement.status: CONFIRMED` and the recipient and asset match. For this route the expected `settlement.confirmedAmount` is `"1000000"`, or 1 wUSDT on Basenet (FA2 `KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE`, token ID `"0"`, 6 decimals). Refresh the wallet balance. Receiving requires no signature or gas from the recipient.

### Browser access

The current Gateway allowlist is `https://app.equiteez.com`, `https://equiteez-app.pages.dev`, and subdomains of `equiteez-app.pages.dev`. Bridge UI's final origin still needs adding. GET/POST/OPTIONS and `Authorization`, `Content-Type`, `Idempotency-Key` are allowed; `Location`, `Idempotency-Replayed`, `Retry-After` are exposed. Cookies are not enabled. CORS is a browser policy, not authentication or an anti-abuse boundary.

### Minimal request handling

```jsx
// savedIntent must already be persisted before this function is called.
async function createOperation(baseUrl, savedIntent) {
  const response = await fetch(`${baseUrl}/v1/operations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${savedIntent.capability}`,
      "Idempotency-Key": savedIntent.idempotencyKey,
    },
    body: JSON.stringify(savedIntent.request),
    cache: "no-store",
  });
  const body = await response.json();
  if (response.status !== 202) {
    // Caller interprets status/code; it must retain the saved idempotency scope.
    throw Object.assign(new Error("Operation request failed"), {
      status: response.status,
      code: body.error?.code,
      requestId: body.error?.requestId,
    });
  }
  return body;
}
```

For type generation, export the generated schema with `app.swagger()` locally; validate actual responses at the client boundary. Wallet transaction construction, secure capability storage and UI error/recovery behavior remain frontend responsibilities. Never embed provider or sponsor secrets in either frontend bundle.
