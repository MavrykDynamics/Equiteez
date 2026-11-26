**Service:** Mavryk Bridge ETH Backend, NEAR Intents (1Click) integration
**Audience:** Bridge UI and Equiteez frontend developers
**API version:** `v0.0.9`, the same as the backend release `v0.0.9`**Protocol:** HTTPS, JSON, client polling. URL prefix `/v1`**Updated:** 26 November 2026

This is the frontend contract: what to call, what to show and what to store. Backend internals, deployment and operations are documented separately and are not needed to integrate.

---

## Table of contents

1. What the integration does
2. Quick start
3. Environments and browser access
4. Conventions
5. Capability and idempotency key
6. Endpoints
   - 6.1 `GET /v1/metadata`
   - 6.2 `POST /v1/quotes/preview`
   - 6.3 `POST /v1/operations`
   - 6.4 `GET /v1/operations/{id}`
7. Networks and address formats
8. The operation object
9. What to show the user
10. Errors
11. Limits and retries
12. Integration checklist
13. Code examples (TypeScript)
14. Changelog since v0.0.6

---

## 1. What the integration does

The user pays with an asset they already hold, for example SOL, BTC or USDC on Base, and receives **wUSDT on Mavryk**.

1. The user picks a source asset and an amount. The frontend shows a preview of what they will receive.
2. The user confirms. The backend prepares an executable quote and a deposit address.
3. The user sends exactly the quoted amount to that deposit address, from any wallet or exchange.
4. 1Click swaps the deposit into USDT0 on Arbitrum One and delivers it to the bridge.
5. The backend forwards it into the bridge and pays that gas. The bridge mints wUSDT to the user's `mv1` address.
6. The backend confirms the mint on Mavryk, and the frontend shows the transfer as complete.

**The frontend does:** list assets, request previews, create the operation, show the deposit instructions, optionally help the user send the deposit from a connected wallet, and show progress.

**The frontend does not:** call bridge or forwarder contracts, pay bridge gas, sign anything on Mavryk or run a claim step. It never holds provider or backend secrets.

Terms used below:

| Term              | Meaning                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Source asset      | What the user pays with, on its own network. Comes from metadata.                                |
| Settlement token  | The token the bridge wraps: USDT0 on Arbitrum One at launch. The user does not choose it.        |
| Destination asset | What the user receives on Mavryk: wUSDT, an FA2 token with 6 decimals.                           |
| Operation         | One transfer. Created by `POST /v1/operations`, read by `GET /v1/operations/{id}`.               |
| Capability        | A random secret the frontend generates per operation. It is the only key to read that operation. |

## 2. Quick start

1. `GET /v1/metadata`. Show `sourceAssets`. Take `defaultSettlementToken`; if it is `null`, the flow is unavailable.
2. Ask for the amount, the Mavryk `mv1` recipient and a refund address on the source network.
3. `POST /v1/quotes/preview`. Show the expected and minimum amounts.
4. On confirmation, generate a capability and an idempotency key, and **save them with the request before sending it**.
5. `POST /v1/operations` with both headers. Save the returned operation ID.
6. Poll `GET /v1/operations/{id}` every `retryAfterMs` (5 seconds).
7. When `fundingStatus` is `AVAILABLE`, show `fundingInstructions`: network, address, exact amount, memo and deadline.
8. Keep polling. The transfer is complete when `settlement.status` is `CONFIRMED`.

## 3. Environments and browser access

| Environment                 | Base URL                                    | State                                                                                                                |
| --------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Test                        | `https://basenet.bridge-api.mavryk.network` | API live. On 26 November 2026 metadata lists no settlement token and no source assets yet, so no transfer can start. |
| Production (Mavryk mainnet) | Provided before launch                      | Not deployed yet.                                                                                                    |
| Local                       | `http://127.0.0.1:8080`                     | Development only; local fixture assets are not real.                                                                 |

- **Interactive reference.** `GET /docs` serves Swagger UI with the generated OpenAPI schema embedded in the page. There is no separate `/openapi.json`. The Swagger UI of this release labels the schema `0.1.0`; it is the `v0.0.9` contract described here.
- **CORS.** Allowed origins today: `https://app.equiteez.com`, `https://equiteez-app.pages.dev` and its subdomains. The Bridge UI origin is added once its URL is confirmed; send it to the backend team. Allowed: `GET`, `POST`, `OPTIONS` and the headers `Authorization`, `Content-Type`, `Idempotency-Key`. Exposed: `Location`, `Idempotency-Replayed`, `Retry-After`. No cookies.
- **HTTPS only** outside local development.

## 4. Conventions

| Topic          | Rule                                                                                                                                                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Amounts        | Decimal **strings** of base units, for example `"5000000"` for 5 USDT0. No JSON numbers, fractions, signs, exponents, spaces or leading zeros. Inputs are positive; outputs can be `"0"`.                                                                       |
| Arithmetic     | Use `BigInt` or string arithmetic. Never `Number`, `parseFloat` or floating-point multiplication. Section 13 has helpers.                                                                                                                                       |
| Units          | `amountIn` and the funding `amount` use the source asset's decimals. `amountOut`, `minAmountOut`, delivery and forwarding amounts use the settlement token's decimals (USDT0: 6). `destination*` and settlement amounts use the destination FA2's decimals (6). |
| Asset identity | `assetId` from metadata. Opaque: never parse it, never key by symbol.                                                                                                                                                                                           |
| Chain IDs      | Strings, for example `"42161"`.                                                                                                                                                                                                                                 |
| Slippage       | Integer basis points chosen by the user, 0 to 9999. 100 = 1%.                                                                                                                                                                                                   |
| Dates          | UTC ISO 8601 strings.                                                                                                                                                                                                                                           |
| Requests       | `Content-Type: application/json`. Unknown fields and query parameters are rejected. Maximum body 16 KiB.                                                                                                                                                        |
| Caching        | API responses carry `Cache-Control: no-store`.                                                                                                                                                                                                                  |

## 5. Capability and idempotency key

### Capability

Creating and reading an operation need:

```
Authorization: Bearer <capability>
```

The capability is **32 cryptographically random bytes, base64url-encoded without padding: 43 characters**, generated by the frontend for each operation. It is not a user login, a wallet signature or an API key.

- Save the capability, the idempotency key and the exact request body **before** the first `POST`.
- Keep it out of URLs, analytics, logs and error reports.
- One capability per transfer; never reuse it.
- It cannot be recovered or rotated. Without it the operation cannot be read through the API; the operation ID alone is not enough. Support can still look an operation up by its ID.
- A missing or malformed capability, an unknown operation and an operation created with another capability all return the same `404`.

### Idempotency key

Creation also needs:

```
Idempotency-Key: <8 to 128 printable ASCII characters, no spaces>
```

`crypto.randomUUID()` works. The key is scoped to the capability.

- **Same capability, key and body:** the original operation is returned with `202` and `Idempotency-Replayed: true`. Nothing new is created.
- **Same capability and key, different body:** `409 IDEMPOTENCY_CONFLICT`.
- **Lost response** (timeout, dropped connection, `500`, `503`): the operation may already exist. Retry with the same capability, key and body. Never generate a new key because a response was lost.

## 6. Endpoints

| Method and path           | Capability                  | Purpose                                              |
| ------------------------- | --------------------------- | ---------------------------------------------------- |
| `GET /v1/metadata`        | No                          | Settlement tokens and the source assets offered now. |
| `POST /v1/quotes/preview` | No                          | Indicative price. Creates nothing.                   |
| `POST /v1/operations`     | Yes, plus `Idempotency-Key` | Create a transfer.                                   |
| `GET /v1/operations/{id}` | Yes                         | Read a transfer.                                     |
| `GET /docs`               | No                          | Swagger UI.                                          |

There is no list endpoint: each frontend keeps its own operation IDs and capabilities. A user switching between Bridge UI and Equiteez does not see the other app's history.

### 6.1 `GET /v1/metadata`

No body, parameters or capability. Example:

```json
{
  "schemaVersion": 2,
  "admissionPaused": false,
  "catalog": { "fetchedAt": "2026-11-25T10:00:00.000Z", "stale": false },
  "defaultSettlementToken": {
    "settlementTokenId": "usdt0-arbitrum",
    "settlementTokenVersion": 1
  },
  "settlementTokens": [
    {
      "settlementTokenId": "usdt0-arbitrum",
      "settlementTokenVersion": 1,
      "isDefault": true,
      "previewSupported": true,
      "settlementAsset": {
        "assetId": "nep141:arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near",
        "chainId": "42161",
        "contractAddress": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        "symbol": "USDT0",
        "decimals": 6
      },
      "destinationAsset": {
        "chainId": "<Mavryk chain ID>",
        "kind": "fa2",
        "contractAddress": "<wUSDT FA2 contract>",
        "tokenId": "0",
        "decimals": 6
      }
    }
  ],
  "sourceAssets": [
    {
      "assetId": "nep141:sol.omft.near",
      "network": "sol",
      "family": "solana",
      "evmChainId": null,
      "depositMode": "SIMPLE",
      "kind": "native",
      "contractAddress": null,
      "symbol": "SOL",
      "decimals": 9,
      "coingeckoId": "solana"
    },
    {
      "assetId": "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near",
      "network": "base",
      "family": "evm",
      "evmChainId": "8453",
      "depositMode": "SIMPLE",
      "kind": "token",
      "contractAddress": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      "symbol": "USDC",
      "decimals": 6,
      "coingeckoId": "usd-coin"
    }
  ]
}
```

**Source assets.** `sourceAssets` is everything the user may choose **now**. Unavailable assets and networks are already left out. A new asset can appear without a frontend release.

| Field             | Meaning                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `assetId`         | Send it back as `sourceAssetId`. Opaque.                                                  |
| `network`         | Network key, one of the twelve in section 7. Hide assets whose key you do not know.       |
| `family`          | `evm`, `solana`, `near`, `aptos` or `bitcoin`: the wallet adapter and the address format. |
| `evmChainId`      | Chain ID for an EVM wallet; `null` for other families.                                    |
| `depositMode`     | `SIMPLE`, or `MEMO` when the deposit needs a memo. Every network is `SIMPLE` today.       |
| `kind`            | `native` (the network's own currency) or `token`.                                         |
| `contractAddress` | Token contract, mint or account; `null` for `native`. Use it to build a wallet transfer.  |
| `symbol`          | Display text. **Not unique**, even within one network.                                    |
| `decimals`        | Base-unit decimals of the asset.                                                          |
| `coingeckoId`     | Icon hint; may be `null`.                                                                 |

**Names, icons and prices.** Metadata has no logos, full names, network names or prices. Map `coingeckoId` to an icon with a fallback, and keep a static network table keyed by `network`. Amounts shown to the user come from the preview.

**Settlement token.** Use `defaultSettlementToken` and show no selector. Send its ID and version in every preview and operation. `destinationAsset` is what the user receives on Mavryk. If `defaultSettlementToken` is `null`, or its entry is missing from `settlementTokens`, stop offering the flow. **Never fall back to another token.**

**Availability flags:**

- `catalog.stale: true`: the asset list is empty and nothing new can start. Show temporary unavailability.
- `admissionPaused: true`: the service is temporarily not accepting new transfers. Previews and creation are refused; existing operations stay readable.
- `previewSupported: false`: previews are unavailable for that token.

Cache metadata for about a minute and refresh it before the user confirms.

### 6.2 `POST /v1/quotes/preview`

No capability or idempotency key. Exactly seven fields:

```json
{
  "sourceAssetId": "nep141:sol.omft.near",
  "settlementTokenId": "usdt0-arbitrum",
  "settlementTokenVersion": 1,
  "recipient": "mv1SdUcjN7zi2ekSwfeTibi83HkVbUnWC1AM",
  "refundAddress": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  "amountIn": "1000000000",
  "slippageBps": 100
}
```

- `recipient`: the user's Mavryk `mv1` address.
- `refundAddress`: an address **on the source network** that the user controls. 1Click refunds there when a swap cannot complete. It is validated before any price is requested, so ask for it before the first preview. Prefer the user's own wallet: a refund to an exchange address may never reach them.
- `amountIn`: source-asset base units. There is no backend minimum or maximum; 1Click accepts the amount or rejects it.
- `slippageBps`: the user's choice.

Example `200`:

```json
{
  "kind": "indicative",
  "executable": false,
  "sourceAssetId": "nep141:sol.omft.near",
  "settlementTokenId": "usdt0-arbitrum",
  "settlementTokenVersion": 1,
  "slippageBps": 100,
  "amountIn": "1000000000",
  "amountOut": "214300000",
  "minAmountOut": "212157000",
  "bridgeableAmountOut": "214300000",
  "bridgeableMinAmountOut": "212157000",
  "destinationAmountOut": "214300000",
  "destinationMinAmountOut": "212157000",
  "destinationAsset": {
    "chainId": "<Mavryk chain ID>",
    "kind": "fa2",
    "contractAddress": "<wUSDT FA2 contract>",
    "tokenId": "0",
    "decimals": 6
  },
  "providerTimestamp": "2026-11-25T10:00:00.000Z",
  "quotedAt": "2026-11-25T10:00:01.000Z",
  "expiresAt": "2026-11-25T10:00:30.000Z",
  "providerTimeEstimateSeconds": 35,
  "refundFee": "1000",
  "withdrawFee": "4000"
}
```

| Field                                             | Meaning                                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `amountOut`, `minAmountOut`                       | Expected and guaranteed minimum output, in settlement-token units.                                                              |
| `bridgeableAmountOut`, `bridgeableMinAmountOut`   | The same rounded down to what Mavryk can represent, still in settlement-token units. For USDT0 (6 decimals) nothing is rounded. |
| `destinationAmountOut`, `destinationMinAmountOut` | What the user receives on Mavryk, in FA2 units (6 decimals). Show these.                                                        |
| `expiresAt`                                       | Freshness limit, at most 30 seconds. Not a funding deadline and not a reserved price.                                           |
| `providerTimeEstimateSeconds`                     | 1Click's swap time after the deposit is confirmed. Excludes the bridge and the mint. May be `null`.                             |
| `withdrawFee`                                     | Settlement-token units, already included in `amountOut`. May be `null`.                                                         |
| `refundFee`                                       | Source units, charged only if a refund happens. May be `null`.                                                                  |

- Show `destinationMinAmountOut` prominently: with a volatile source asset it is what the user is protected by.
- Request a new preview after any input change and before confirmation. Ignore late responses for old inputs.
- Keep one preview in flight and debounce typing (section 11).
- A preview creates nothing and exposes no deposit address.

### 6.3 `POST /v1/operations`

```
POST /v1/operations
Authorization: Bearer <capability>
Idempotency-Key: <idempotency key>
Content-Type: application/json
```

Exactly eight fields: the seven of the preview plus `acceptedMinAmountOut`, the minimum the user accepted, **in settlement-token units**. Use the displayed `bridgeableMinAmountOut`:

```json
{
  "sourceAssetId": "nep141:sol.omft.near",
  "settlementTokenId": "usdt0-arbitrum",
  "settlementTokenVersion": 1,
  "recipient": "mv1SdUcjN7zi2ekSwfeTibi83HkVbUnWC1AM",
  "refundAddress": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  "amountIn": "1000000000",
  "slippageBps": 100,
  "acceptedMinAmountOut": "212157000"
}
```

Response **`202`** with the full operation (section 8) and these headers:

```
Location: /v1/operations/<operation id>
Idempotency-Replayed: false
```

- `202` means the operation is saved, not that a deposit address exists. The first state is normally `phase: PREPARING_QUOTE`, `fundingStatus: NOT_READY`, `fundingInstructions: null`.
- The backend then requests a new executable quote. Its price can differ from the preview, but it is never accepted below `acceptedMinAmountOut`. If no acceptable quote can be obtained, the operation closes with `closure: QUOTE_REJECTED` and no deposit address is ever shown.
- The operation keeps the asset and token it was created with. A later pause does not change it.
- An EVM refund address is returned lower-cased; other addresses exactly as sent.

### 6.4 `GET /v1/operations/{id}`

```
GET /v1/operations/<operation id>
Authorization: Bearer <the same capability>
```

Returns `200` with the operation. Read-only: polling never changes anything and never replaces a deposit address. Poll every `retryAfterMs` while the user is waiting; section 9 says when to stop.

Example once the deposit address is published:

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "phase": "AWAITING_DEPOSIT",
  "attention": "NONE",
  "closure": "OPEN",
  "fundingStatus": "AVAILABLE",
  "fundingInstructions": {
    "quoteId": "00000000-0000-4000-8000-000000000002",
    "sourceNetwork": "sol",
    "originAsset": "nep141:sol.omft.near",
    "depositAddress": "<deposit address on the source network>",
    "depositMemo": null,
    "amount": "1000000000",
    "amountOut": "214300000",
    "minAmountOut": "212157000",
    "bridgeableAmountOut": "214300000",
    "bridgeableMinAmountOut": "212157000",
    "deadline": "2026-11-25T10:10:00.000Z",
    "fundingExpiresAt": "2026-11-25T10:09:00.000Z",
    "forwarderAddress": "<bridge forwarder on Arbitrum One>"
  },
  "retryAfterMs": 5000
}
```

Example of a completed transfer (excerpt):

```json
{
  "phase": "WRAPPED",
  "fundingStatus": "OBSERVED",
  "fundingInstructions": null,
  "settlement": {
    "status": "CONFIRMED",
    "confirmedAmount": "214300000",
    "tokenAddress": "<wUSDT FA2 contract>",
    "tokenId": "0",
    "mavrykChainId": "<Mavryk chain ID>",
    "mints": [
      {
        "wrapTransactionHash": "0x…",
        "wrapLogIndex": 4,
        "operationHash": "<Mavryk operation hash>",
        "blockHash": "<Mavryk block hash>",
        "level": 123456,
        "amount": "214300000"
      }
    ]
  }
}
```

## 7. Networks and address formats

Twelve networks are supported. Each appears in metadata only after it is enabled. The refund address must match the network's format, or the request is refused with `400 VALIDATION_ERROR`.

| `network` | Network           | `family`  | `evmChainId` | Refund address accepted                                                                                 |
| --------- | ----------------- | --------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `eth`     | Ethereum          | `evm`     | `1`          | `0x` + 40 hex. A mixed-case address must have a valid EIP-55 checksum. Not the zero address.            |
| `arb`     | Arbitrum One      | `evm`     | `42161`      | As above.                                                                                               |
| `base`    | Base              | `evm`     | `8453`       | As above.                                                                                               |
| `op`      | OP Mainnet        | `evm`     | `10`         | As above.                                                                                               |
| `pol`     | Polygon           | `evm`     | `137`        | As above.                                                                                               |
| `bsc`     | BNB Smart Chain   | `evm`     | `56`         | As above.                                                                                               |
| `avax`    | Avalanche C-Chain | `evm`     | `43114`      | As above.                                                                                               |
| `gnosis`  | Gnosis            | `evm`     | `100`        | As above.                                                                                               |
| `sol`     | Solana            | `solana`  | `null`       | Base58 public key (32 bytes).                                                                           |
| `near`    | NEAR              | `near`    | `null`       | Account ID, 2 to 64 characters: a named account (`alice.near`) or a 64-hex implicit account. Lowercase. |
| `aptos`   | Aptos             | `aptos`   | `null`       | Full `0x` + 64 hex. Short forms are rejected.                                                           |
| `btc`     | Bitcoin           | `bitcoin` | `null`       | Mainnet `1…`, `3…`, `bc1q…` or `bc1p…`. Not mixed case.                                                 |

- Solana, NEAR and Aptos addresses have no checksum: a typo can still be a valid address. Let the user paste the address and confirm it.
- The **recipient** is always a Mavryk `mv1` address with a valid checksum. `mv2`, `mv3` and `KT1` addresses are rejected.
- **Bitcoin is slow.** A Bitcoin deposit has to be mined before the deadline, so its funding window closes about an hour before the quote deadline, and the quote lives up to three hours. Always use `fundingExpiresAt` from the instructions, never your own timer.
- USDT0 on Arbitrum One, the settlement token itself, is never offered as a source asset.

## 8. The operation object

### Fields

The operation repeats the eight request fields and adds:

| Field                          | Meaning                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `id`                           | Operation UUID.                                                                                     |
| `phase`                        | How far the transfer has progressed.                                                                |
| `attention`                    | Why it is waiting or needs care. Shown on top of the phase.                                         |
| `closure`                      | `OPEN`, or `QUOTE_REJECTED` when it ended before a deposit address was shown.                       |
| `revision`                     | Version of the stored record. Other fields can change without it; do not use it to skip UI updates. |
| `fundingStatus`                | Whether the user may send the deposit now.                                                          |
| `fundingInstructions`          | Deposit instructions, or `null`.                                                                    |
| `providerStatus`               | 1Click's report, or `null`.                                                                         |
| `delivery`                     | Arrival of the swapped tokens at the bridge on Arbitrum One.                                        |
| `forwarding`                   | Entry into the bridge.                                                                              |
| `settlement`                   | The mint on Mavryk.                                                                                 |
| `refund`                       | A refund reported by 1Click, or `null`.                                                             |
| `createdAt`, `updatedAt`       | Timestamps.                                                                                         |
| `lastCheckedAt`, `nextCheckAt` | When 1Click was last and will next be asked. Not an ETA.                                            |
| `retryAfterMs`                 | Polling interval: 5000.                                                                             |

### `phase`

| Value                | Meaning                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| `PREPARING_QUOTE`    | Getting an executable quote and a deposit address.                                  |
| `AWAITING_DEPOSIT`   | Deposit address published; check `fundingStatus`.                                   |
| `SWAP_IN_PROGRESS`   | Deposit seen; 1Click is swapping.                                                   |
| `VERIFYING_DELIVERY` | The swapped tokens are being verified on Arbitrum One.                              |
| `DELIVERY_VERIFIED`  | The swapped tokens arrived at the bridge.                                           |
| `FORWARDING`         | The tokens are entering the bridge.                                                 |
| `WRAPPED`            | The bridge accepted the tokens. **Not yet received on Mavryk**: check `settlement`. |

There is no `COMPLETED` phase. The transfer is complete when `settlement.status` is `CONFIRMED`.

### `attention`

| Value                                 | Meaning                                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `NONE`                                | Nothing to report.                                                                                          |
| `RETRYING`                            | A temporary failure; it retries by itself. Keep polling.                                                    |
| `PROVIDER_UNAVAILABLE`                | 1Click status is temporarily unavailable. Keep polling.                                                     |
| `SETTLEMENT_TOKEN_PAUSED`             | Transfers are paused. No deposit address is issued; a published one shows `PAUSED`.                         |
| `SOURCE_PAUSED`                       | The source asset or its network is paused. No new deposit address; a deposit already made is still tracked. |
| `DEPOSIT_INCOMPLETE`                  | 1Click received less than the exact amount. Do not ask for a top-up; 1Click refunds at the deadline.        |
| `REFUND_PENDING`                      | 1Click reports a refund.                                                                                    |
| `MANUAL_REVIEW`, `RECONCILE_REQUIRED` | The team has to check this transfer. Do not ask the user to pay again.                                      |

### `closure`

`QUOTE_REJECTED` means the backend could not get an acceptable quote: the price fell below the accepted minimum, 1Click declined, preparation took too long (30 minutes), or the asset changed. **No deposit address was ever shown and nothing was sent.** Offer a new transfer with a new capability and key.

### Funding

| `fundingStatus` | Meaning                                          | UI                                                |
| --------------- | ------------------------------------------------ | ------------------------------------------------- |
| `NOT_READY`     | No deposit address yet.                          | Wait.                                             |
| `AVAILABLE`     | `fundingInstructions` is set and valid now.      | Show the deposit screen.                          |
| `EXPIRED`       | The funding window closed.                       | Disable sending. Do not reuse saved instructions. |
| `PAUSED`        | Paused, under review or temporarily unavailable. | Disable sending.                                  |
| `OBSERVED`      | The deposit was seen.                            | Hide the send action for good.                    |

**`fundingInstructions` is not `null` only while `fundingStatus` is `AVAILABLE`.** Keep a local copy of what you showed, for history and support. Never treat that copy as permission to send.

| Field                                           | Meaning                                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `sourceNetwork`                                 | Network of the deposit (section 7).                                                                      |
| `originAsset`                                   | Asset to send: the `sourceAssetId`.                                                                      |
| `depositAddress`                                | Where to send, on `sourceNetwork`.                                                                       |
| `depositMemo`                                   | When not `null`, the deposit must carry this memo. Show it as prominently as the address.                |
| `amount`                                        | **Exact** amount to send, in source base units.                                                          |
| `amountOut`, `minAmountOut`                     | Expected and minimum output of the executable quote, in settlement-token units.                          |
| `bridgeableAmountOut`, `bridgeableMinAmountOut` | The same rounded to Mavryk precision, still in settlement-token units.                                   |
| `deadline`                                      | 1Click's quote deadline.                                                                                 |
| `fundingExpiresAt`                              | **Send before this.** Earlier than `deadline` by a safety margin: 60 seconds, about an hour for Bitcoin. |
| `forwarderAddress`                              | The bridge forwarder on Arbitrum One. Informational. **Never a deposit address.**                        |
| `quoteId`                                       | ID of the executable quote, for support.                                                                 |

- **The amount must arrive exactly.** The swap is exact-input. An exchange that deducts a withdrawal fee delivers less, and 1Click then refunds instead of swapping. Say so next to the amount.
- **A wallet is optional.** Show the address, a QR code, the exact amount, the memo, `fundingExpiresAt` and the refund address, so the user can pay from any wallet or exchange.
- **Instructions never change.** The deposit address of an operation is never replaced. A new transfer needs a new operation.

### `providerStatus`

1Click's report, never proof by itself: `PENDING_DEPOSIT`, `KNOWN_DEPOSIT_TX`, `INCOMPLETE_DEPOSIT`, `PROCESSING`, `SUCCESS`, `REFUNDED`, `FAILED`, or `null`. **`SUCCESS` does not mean the user received anything on Mavryk.** `INCOMPLETE_DEPOSIT` sets `attention: DEPOSIT_INCOMPLETE`, `REFUNDED` sets `REFUND_PENDING`, and `FAILED` sets `MANUAL_REVIEW`. Render `attention`, not `providerStatus`.

### `delivery`

| Field                                | Meaning                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `status`                             | `NOT_OBSERVED`, `VERIFYING`, `VERIFIED`, `AMBIGUOUS` or `RECONCILE_REQUIRED`. |
| `expectedAmount`                     | Expected settlement-token amount, or `null`.                                  |
| `confirmedAmount`                    | Verified amount that arrived.                                                 |
| `transferCount`, `transactionHashes` | Arbitrum One transfers credited to this operation.                            |

### `forwarding`

| Field                                               | Meaning                                                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `status`                                            | `NOT_READY`, `READY`, `IN_PROGRESS`, `RECONCILE_REQUIRED` or `WRAPPED`.                                  |
| `transactionHash`                                   | Arbitrum One transaction that entered the bridge, once sent.                                             |
| `wrappedAmount`                                     | Amount accepted by the bridge.                                                                           |
| `bridgeableAmount`, `remainingAmount`, `dustAmount` | Amount that can be bridged, amount still waiting, and a sub-unit remainder. Always `"0"` dust for USDT0. |
| `bridgeEvents`                                      | Bridge events: `transactionHash`, `logIndex`, `amount`.                                                  |

### `settlement`

| Field                                      | Meaning                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`                                   | `NOT_TRACKED`, `PENDING`, `CONFIRMED` or `RECONCILE_REQUIRED`.                                                                                          |
| `confirmedAmount`                          | Amount received on Mavryk, FA2 units (6 decimals).                                                                                                      |
| `tokenAddress`, `tokenId`, `mavrykChainId` | The received token. Check them against `destinationAsset` from metadata.                                                                                |
| `mints`                                    | Mint evidence on Mavryk: `operationHash`, `blockHash`, `level`, `amount`, and the bridge event it belongs to. Use `operationHash` for an explorer link. |

`NOT_TRACKED` means this deployment does not confirm the mint. The transfer may still have completed; show "bridged, check your Mavryk balance".

### `refund`

`{ "status": "REPORTED", "amount", "asset", "recipient" }`: 1Click reports a refund of `amount` of `asset` (source units) to `recipient`, the refund address. It is 1Click's report, not a verified on-chain refund.

### Under review

While a transfer is under review (`attention: MANUAL_REVIEW` or `RECONCILE_REQUIRED`), the API may report `settlement.status` and `forwarding.status` as `RECONCILE_REQUIRED` and amounts already credited as `"0"` until the check is finished. **That does not mean the funds are lost.** Show "under review" with the operation ID, and never suggest a second deposit.

## 9. What to show the user

Check the rows from the top; the first match wins. Show `attention` notices alongside.

| Condition                                             | Show                                                                                                       | Actions                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `settlement.status` = `CONFIRMED`                     | "Received `confirmedAmount` wUSDT on Mavryk", explorer link from `mints`.                                  | Done. Stop polling.                     |
| `closure` = `QUOTE_REJECTED`                          | "We couldn't get a price. Nothing was sent."                                                               | Start a new transfer. Stop polling.     |
| `attention` = `MANUAL_REVIEW` or `RECONCILE_REQUIRED` | "Your transfer is being checked." Operation ID for support.                                                | No send, no retry. Keep polling slowly. |
| `refund` is not `null`                                | "1Click reports a refund of … to `refundAddress`."                                                         | Keep polling.                           |
| `attention` = `DEPOSIT_INCOMPLETE`                    | "The amount received did not match. It will be refunded."                                                  | Do not top up.                          |
| `fundingStatus` = `AVAILABLE`                         | Deposit screen: network, exact amount, address, memo, QR, countdown to `fundingExpiresAt`.                 | Send from a wallet or copy the details. |
| `fundingStatus` = `NOT_READY`                         | "Preparing your deposit address…"                                                                          | Wait.                                   |
| `fundingStatus` = `EXPIRED`                           | "The deposit window has closed. Do not send." If the user already sent, show the operation ID for support. | New transfer.                           |
| `fundingStatus` = `PAUSED` before any deposit         | "Temporarily unavailable. Do not send."                                                                    | Wait or start later.                    |
| `SWAP_IN_PROGRESS`, `VERIFYING_DELIVERY`              | "Deposit received, swapping."                                                                              | Keep polling.                           |
| `DELIVERY_VERIFIED`, `FORWARDING`                     | "Bridging to Mavryk."                                                                                      | Keep polling.                           |
| `WRAPPED` and `settlement.status` = `PENDING`         | "Waiting for Mavryk confirmation."                                                                         | Keep polling.                           |
| `WRAPPED` and `settlement.status` = `NOT_TRACKED`     | "Bridged. Check your Mavryk balance."                                                                      | Stop polling.                           |

- Show the stages separately: deposit, swap, bridge, received on Mavryk. Never show "received" on `providerStatus: SUCCESS` or `phase: WRAPPED` alone.
- After the user sends, disable the send button locally right away; the API reports `OBSERVED` a few seconds later.
- An operation whose funding window expired with no deposit can leave active polling, but keep it in history: a late deposit is still tracked.
- Refresh the user's Mavryk balance independently once the transfer is confirmed.

## 10. Errors

Every error has the same shape:

```json
{
  "error": {
    "code": "SOURCE_ASSET_UNAVAILABLE",
    "message": "Human-readable explanation",
    "requestId": "<request uuid>"
  }
}
```

Branch on the HTTP status and `code`, never on `message`. Show or log `requestId` for support. Keep a fallback for unknown codes.

| HTTP | Code                                                                                                                       | What the frontend does                                                                                                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `VALIDATION_ERROR`                                                                                                         | Fix the input: a field format, an amount encoding, the idempotency key, a recipient that is not `mv1`, or a refund address invalid for the source network. Do not retry unchanged. |
| 404  | `NOT_FOUND`, `OPERATION_NOT_FOUND`                                                                                         | Wrong or missing capability, or unknown operation. Check the saved capability.                                                                                                     |
| 409  | `SOURCE_ASSET_UNAVAILABLE`                                                                                                 | The asset or its network is no longer offered. Refresh metadata.                                                                                                                   |
| 409  | `SETTLEMENT_TOKEN_UNAVAILABLE`                                                                                             | The settlement token is paused or changed. Refresh metadata; stop the flow if there is no default. Never switch tokens.                                                            |
| 409  | `ADMISSION_CHANGED`                                                                                                        | Availability changed during the preview. Refresh metadata and preview again.                                                                                                       |
| 409  | `DIRECT_WRAP_UNSUPPORTED`                                                                                                  | The source asset is the settlement token itself. Not supported.                                                                                                                    |
| 409  | `AMOUNT_TOO_LOW`, `AMOUNT_TOO_HIGH`                                                                                        | 1Click does not quote this amount. Ask for a larger or smaller one. The exact limit is not known to the backend.                                                                   |
| 409  | `PROVIDER_REJECTED`                                                                                                        | No quote for this input. Change the asset, the amount or the slippage.                                                                                                             |
| 409  | `PREVIEW_BELOW_MINIMUM`                                                                                                    | The output is below the bridge minimum. Ask for a larger amount.                                                                                                                   |
| 409  | `IDEMPOTENCY_CONFLICT`                                                                                                     | The key was already used with another body: a frontend bug. Recover the original operation.                                                                                        |
| 413  | `PAYLOAD_TOO_LARGE`                                                                                                        | Body over 16 KiB.                                                                                                                                                                  |
| 415  | `UNSUPPORTED_MEDIA_TYPE`                                                                                                   | Send `application/json`.                                                                                                                                                           |
| 429  | `RATE_LIMITED`                                                                                                             | Too many requests. Wait for `Retry-After` when present, with jitter.                                                                                                               |
| 429  | `PREVIEW_BUSY`                                                                                                             | Preview capacity is busy. Retry after `Retry-After` (60).                                                                                                                          |
| 429  | `ADMISSION_CAPACITY_EXCEEDED`                                                                                              | Too many transfers are waiting for a deposit, from this client or overall. Fund or abandon an open one, or retry after `Retry-After` (60).                                         |
| 500  | `INTERNAL_ERROR`                                                                                                           | Back off. A creation retry uses the same capability, key and body.                                                                                                                 |
| 503  | `CATALOG_STALE`                                                                                                            | The asset list is out of date; nothing new can start. Try later.                                                                                                                   |
| 503  | `METADATA_DISABLED`, `QUOTE_PREVIEW_DISABLED`                                                                              | The feature is off on this deployment. Hide it.                                                                                                                                    |
| 503  | `RECOVERY_MODE`                                                                                                            | Previews are paused. Try later.                                                                                                                                                    |
| 503  | `DEPENDENCY_UNAVAILABLE`                                                                                                   | Temporary failure, or new transfers are paused. Back off; existing operations stay readable.                                                                                       |
| 503  | `METADATA_UNAVAILABLE`, `PROVIDER_UNAVAILABLE`, `PROVIDER_AUTH_UNAVAILABLE`, `INVALID_QUOTE`, `PREVIEW_EXPIRED`, any other | Temporary. Back off and retry. Never ask the user to send funds based on an old result.                                                                                            |

Problems after creation (a rejected quote, a partial deposit, a refund, a review) appear in the operation, not as HTTP errors.

## 11. Limits and retries

| Limit                     | Value                                                                      | Response                                                                                       |
| ------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Requests per client       | 60 a minute                                                                | `429 RATE_LIMITED`. Headers `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`. |
| Previews                  | About 10 a minute per client, few at a time                                | `429 PREVIEW_BUSY`, `Retry-After: 60`.                                                         |
| Open transfers per client | 3 waiting for a quote or deposit within 30 minutes; 200 across the service | `429 ADMISSION_CAPACITY_EXCEEDED`, `Retry-After: 60`.                                          |

- A client is an IP address (an IPv6 /64 counts as one). Users behind the same NAT share the limits. A new capability, key or recipient does not reset them.
- Poll at `retryAfterMs`. Back off exponentially with jitter on errors, up to about a minute.
- Request a preview only for the selected asset, after typing settles; cancel or ignore older ones.
- Use a client timeout of about 15 seconds per request.

## 12. Integration checklist

- [ ] Metadata loaded; assets grouped by `network` with your own names and icons; unknown network keys hidden.
- [ ] No settlement-token selector; the flow stops when `defaultSettlementToken` is `null`.
- [ ] Refund address validated by the user's confirmation and by the API; recipient is `mv1`.
- [ ] Amounts parsed and formatted with `BigInt`; never floats.
- [ ] Preview shows `destinationMinAmountOut`, fees and the time estimate; refreshed before confirmation.
- [ ] Capability, idempotency key and request saved **before** the `POST`; retries reuse all three.
- [ ] Operation ID saved after `202`, and kept in the user's history.
- [ ] Deposit screen only on `fundingStatus: AVAILABLE`, with the exact amount, memo when present and `fundingExpiresAt`.
- [ ] Warning that exchanges deducting fees cause a refund.
- [ ] Send action hidden for good after `OBSERVED`; never shown again for `EXPIRED` or `PAUSED`.
- [ ] "Received" shown only on `settlement.status: CONFIRMED`.
- [ ] Review states show the operation ID and never suggest paying again.
- [ ] Capabilities never in URLs, logs, analytics or error reports.
- [ ] Every error code in section 10 handled, plus a fallback for unknown ones.
- [ ] Your production origin sent to the backend team for CORS.

## 13. Code examples (TypeScript)

### Capability and amounts

```tsx
// 32 random bytes, base64url without padding: 43 characters.
export function newCapability(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// "1.5" with 9 decimals -> "1500000000". Throws on invalid input.
export function toBaseUnits(input: string, decimals: number): string {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(input.trim());
  if (!match) throw new Error("Invalid amount");
  const [, whole, fraction = ""] = match;
  if (fraction.length > decimals)
    throw new Error(`At most ${decimals} decimal places`);
  const units = BigInt(whole + fraction.padEnd(decimals, "0"));
  if (units === 0n) throw new Error("Amount must be positive");
  return units.toString();
}

// "1500000000" with 9 decimals -> "1.5".
export function fromBaseUnits(value: string, decimals: number): string {
  const units = BigInt(value);
  const base = 10n ** BigInt(decimals);
  const fraction = (units % base)
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return fraction ? `${units / base}.${fraction}` : (units / base).toString();
}
```

### Create the operation

```tsx
export interface SavedIntent {
  capability: string;
  idempotencyKey: string;
  request: Record<string, string | number>; // the eight fields, exactly as sent
  operationId?: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
    readonly requestId?: string
  ) {
    super(code ?? `HTTP ${status}`);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const backoff = (attempt: number) =>
  Math.min(60_000, 1000 * 2 ** attempt) + Math.random() * 1000;

// `intent` must already be saved durably. Retries reuse the same capability, key and body.
export async function createOperation(baseUrl: string, intent: SavedIntent) {
  for (let attempt = 0; ; attempt++) {
    let response: Response | undefined;
    try {
      response = await fetch(`${baseUrl}/v1/operations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${intent.capability}`,
          "Idempotency-Key": intent.idempotencyKey,
        },
        body: JSON.stringify(intent.request),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      // Network error or timeout: the operation may exist. Retry the same intent.
    }
    if (response?.status === 202) return response.json(); // save operation.id next
    if (response && response.status !== 500 && response.status !== 503) {
      const body = await response.json().catch(() => null);
      throw new ApiError(
        response.status,
        body?.error?.code,
        body?.error?.requestId
      );
    }
    if (attempt >= 5) throw new ApiError(response?.status ?? 0, "UNAVAILABLE");
    await sleep(backoff(attempt));
  }
}
```

### Poll the operation

```tsx
export async function pollOperation(
  baseUrl: string,
  intent: SavedIntent,
  onUpdate: (operation: any) => void,
  signal: AbortSignal
) {
  let failures = 0;
  while (!signal.aborted) {
    let delay: number;
    try {
      const response = await fetch(
        `${baseUrl}/v1/operations/${intent.operationId}`,
        {
          headers: { Authorization: `Bearer ${intent.capability}` },
          cache: "no-store",
          signal,
        }
      );
      if (response.status === 404)
        throw new ApiError(404, "OPERATION_NOT_FOUND");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const operation = await response.json();
      onUpdate(operation);
      if (
        operation.settlement.status === "CONFIRMED" ||
        operation.closure === "QUOTE_REJECTED"
      )
        return operation;
      failures = 0;
      delay = operation.retryAfterMs + Math.random() * 1000;
    } catch (error) {
      if (signal.aborted) return; // the screen was closed
      if (error instanceof ApiError) throw error; // 404: wrong capability or operation ID
      delay = backoff(failures++);
    }
    await sleep(delay);
  }
}
```

## 14. Changelog since v0.0.6

Changes that matter to the frontend, from `v0.0.6` to `v0.0.9`. The request and response shape changed in `v0.0.8`; `v0.0.9` changes nothing in the API. There is no compatibility layer: both frontends switch together.

**Removed**

- `GET /v1/routes` (now 404) and the route model: `routeId`, `routeVersion`, per-route amount limits and the slippage cap.
- `sourceAddress` in the preview and in the operation.
- `POST /v1/operations/{id}/deposit`, the connected-wallet deposit registration of the Basenet test.
- `fundingInstructions.sourceChainId`, replaced by `sourceNetwork`.
- The attention value `ROUTE_PAUSED`.
- The error codes `ROUTE_UNAVAILABLE`, `ROUTE_LIMIT_EXCEEDED`, `AMOUNT_OUT_OF_RANGE`, `SLIPPAGE_OUT_OF_RANGE`, `MIN_OUTPUT_TOO_LOW`, `QUOTE_PREVIEW_UNSUPPORTED` and `REHEARSAL_*`.

**Changed**

- `GET /v1/metadata` returns `schemaVersion: 2`: `settlementTokens`, `defaultSettlementToken`, `sourceAssets` and `catalog` (section 6.1).
- The preview takes seven fields and creation eight, with `sourceAssetId`, `settlementTokenId` and `settlementTokenVersion` (sections 6.2 and 6.3).
- `refundAddress` is an address of the source network, in any of five formats (section 7), not only EVM.
- `fundingInstructions.depositAddress` can be a non-EVM address, and `depositMemo` can be a string, which is then required.
- `fundingExpiresAt` depends on the source network: about an hour before the deadline for Bitcoin.
- The amount and slippage are no longer limited by the backend; 1Click accepts or rejects the amount, and the user chooses the slippage.

**Added**

- Source assets on twelve networks, from the 1Click catalog. New assets appear without a release.
- The attention values `SETTLEMENT_TOKEN_PAUSED` and `SOURCE_PAUSED`.
- The error codes `SOURCE_ASSET_UNAVAILABLE`, `SETTLEMENT_TOKEN_UNAVAILABLE`, `ADMISSION_CHANGED`, `DIRECT_WRAP_UNSUPPORTED`, `AMOUNT_TOO_LOW`, `AMOUNT_TOO_HIGH`, `CATALOG_STALE` and `429 ADMISSION_CAPACITY_EXCEEDED`.
- A limit of 3 transfers waiting for a deposit per client, and 200 across the service (section 11).
- `/docs` assets are cached for an hour.
