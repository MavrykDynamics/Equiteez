Read AGENTS.md, gas.md, gas-plan.md, docs/gasless-trading.md, api.yaml, and docs/fixtures/permit-deployment/README.md.

Implement Phase 4 — Durable relay lifecycle and recovery in gas-plan.md. Stop after Phase 4. Do not commit or deploy. Preserve all unrelated/staged changes, including app/generated/sitemap-routes.ts. I will perform connected-wallet and end-to-end testing after all phases are implemented; continue independently verifiable work without repeatedly requesting credentials.

Context:
- Phases 1 and 2 are implemented. Phase 3 now provides ordinary permit construction/signing/verification and a reusable review UI. Inspect and reuse current code; do not reimplement them.
- app/contracts/orderbookPayload.ts is the shared direct/permit order validator. Preserve ticks, rounding, direct APIs and grant/order/revoke behavior.
- app/contracts/orderbookPermit.ts builds secondary buy/sell, same-book 1–10 cancellation batches, refunds, operator grants and top-up action data; readPermitOperator reports present/absent/unreadable conservatively.
- app/contracts/permit.ts exposes preparePermit, signPreparedPermit and assertPermitCurrent. Supply the existing toolkit and Beacon client through PermitRuntime, live config refresh and a synchronous current-scope reader. Scope includes wallet, authenticated wallet, network, RPC, chain ID, API URL and a monotonic revision; increment revision on account/network/auth transitions, including away-and-back during async work. Before an ordinary POST, revalidate the reviewed permit with assertPermitCurrent; recovery retries must preserve the exact already-submitted payload/key instead of rebuilding it.
- signPreparedPermit returns validated operation/ordinary request data without submission. RPermitReview displays the frozen review and signs on explicit acceptance, returning through onSigned. It is not mounted in trading flows yet: trade routing and sequential plans belong to Phase 5. No relay POST or wallet transaction submission was added in Phase 3.
- Executable generation fingerprints and six generated public signatures are backed by live read-only RPC interpreter acceptance at a pinned Basenet block. Ordinary signature tests cover edpk/sppk/p2pk. This is not wallet-extension or live relay verification. Numeric-string timestamp packing was incompatible: use the existing RFC3339 conversion; do not change the domain/hash rules.
- Top-up action construction/review exists, but signing is explicitly blocked because the HTTP request omits the deployed token's signed deadline and its reconstruction rule remains unspecified. Preserve this guard. Top-up duplicate-signature/idempotency/correlation guarantees also remain unresolved. Do not invent fields or treat an empty open list as proof that a submission never happened.
- Public relay config was retrieved successfully (HTTP 200); supplied access tokens returned HTTP 401. Historical Cloudflare 403/1010 fixtures are not current success fixtures. Do not save tokens, login signatures or private keys.
- Repository typecheck failures in seven untouched paths and the baseline bridge widget failure are documented in gas-plan.md. Distinguish them from regressions.

Implement the full Phase 4 checklist, including:
1. One scoped RelayProvider above route/loading gates, reusing React Query and the existing notifier. Keep bridge and primary ownership unchanged.
2. Durable ordinary attempts saved before POST, exact payload/idempotency-key retries, unknown-outcome locks across reload and transport changes, bounded remedy handling and safe storage failure behavior.
3. Correct 202 seeding versus confirmation, three-second polling (thirty with authenticated notifier), partial event merging by updatedAt, terminal fee amendments, deduplication and cursor-complete reconciliation.
4. Account/network/API isolation, late-result rejection, cross-tab reconciliation, 409 adoption only after intent comparison, ten-minute Still processing state, and no automatic remaining signatures on reload.
5. Persistent minimize/details presentation, confirmed-action cache invalidation and once-only terminal notifications. Follow designer/new-r-design and update their registries for new R components.
6. Preserve pending top-up suppression/reconciliation safety where possible; leave unsupported top-up submission blocked. Never synthesize credit balances, settlement or bridge signer events.

Do not implement Phase 5 trade execution routing/sequential plans, Phase 6 Credits UI, or Phase 7 history integration. Do not claim that acceptance or confirmed setup equals a completed order.

Run deterministic lifecycle/storage/retry tests, relevant permit/API regressions, notifier/bridge tests affected by provider/root changes, targeted ESLint, typecheck and build. Avoid the sitemap-generating prebuild. Update gas-plan.md and its Documentation Update requirements with changed files, validation, limitations and exact next steps. Do not write Status: Complete unless all required work and validation pass.

Finish with a concise summary and a ready-to-copy Phase 5 request for a new chat window.
