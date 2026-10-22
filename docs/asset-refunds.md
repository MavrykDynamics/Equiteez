# Claim all refunds for one asset

The asset trade page exposes `AssetRefundAll`. It reads the authenticated backend cursor endpoint `/wallets/{wallet}/refunds?token_address={asset}` to completion, then groups eligible orders by orderbook and prepares deterministic chunks. Closed orders with a positive residual qualify; this action leaves active orders running. Historical books are included; a book without relay support remains available through explicitly selected MVRK.

Build-time configuration (Vite's existing environment injection):

- `REFUND_ALL_ENABLED=true`: enable new preparations. Default off. Saved operations remain available for tracking after disabling it.
- `REFUND_ALL_CHUNK_SIZE=10`: initial maximum orders per part, range 1–100. This conservative default is not a measured gas guarantee. Direct estimation can split it further; actual signed gasless permits are simulated by Gas Station before injection.

Release requires verifying deployed refund lambdas/permit schemas, historical indexer coverage and gas/bytes limits for the target network. Enable only after direct and Credits testnet checks. No contract migration is needed.

`app/lib/refunds/model.ts` validates raw integer strings, follows all pages including empty intermediate pages, preserves token IDs and totals with BigInt. `api.ts` retries a 429 at the same cursor. `transport.ts` packs the live permit schema, verifies the returned signature, checks wallet and RPC networks, estimates direct calls, and matches confirmations to the exact signer/ordered list within a potentially shared Gas Station hash. Payout totals come from the matching transaction's applied internal FA2 transfers, excluding unrelated batch members and no-ops.

`runner.ts` executes one part at a time. It persists signed bytes and idempotency key before POST. A timeout retains those exact bytes for retry; a missing direct wallet response stays unknown until a matching hash is supplied. Confirmations wait for two successor blocks, canonical receipt membership and indexer catch-up. Only then does the next signature use the new chain counter. localStorage keys bind wallet/network/asset; a Web Lock prevents concurrent tabs from executing the same run. Keep browser storage until the run is resolved.

Credits fees use the resolved `feeSchedule`: a missing refund variant is free; a missing schedule while fees are enabled is an error. Credits and MVRK require an explicit choice. A gasless failure never silently falls back to native fees. The UI reports unavailable orders, confirmed/failed/unknown parts, transaction identifiers, actual received tokens and remaining candidates from a final full scan.

A proven `OPERATION_RESOURCE_LIMIT` or `PAYLOAD_TOO_LARGE` allows smaller parts with a refreshed preview and new signature. The client stops reducing at one order. Other simulation failures do not imply an oversized batch. Backend ingress is 64 KiB; Gas Station ingress is 256 KiB. Gas Station must include `OPERATION_RESOURCE_LIMIT` in `FEE_REFUND_ON` to return any service fee charged before the isolated resource rejection.

Regression tests: `npm run test:run -- app/lib/refunds app/lib/organisms/AssetRefundAll 'app/routes/trade.$address/components/AssetTabs/AssetTabs.test.tsx'`. They use local mocks, SDK encoders and receipt fixtures; they do not submit transactions or replace sandbox/testnet validation.
