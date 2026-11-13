Date: 2026-11-05
Status: proposed task; no implementation or live provider/registrar validation completed.
Components: Equiteez App, RWA Backend, existing KYC provider/onboarding service if available, registrar, Mavryk contracts/indexer.
Owners: frontend and backend engineering; compliance/registrar owner confirms provider, approval policy, and deployed authority.

Source of scope: Dynamic integration plan, sections 6, 11 and 15.7.
Related delivery work: Relay idempotency and timeout recovery. Registrar recovery has the same unknown-outcome constraint, but must not assume the trading relay already accepts KYC operations.

## Problem and intended outcome

A user can own a Dynamic-derived Mavryk address and authenticate to RWA, yet cannot complete the current Equiteez KYC journey without being directed to WE. Creating a wallet or completing Dynamic email OTP does not register that address for trading.

Deliver an authenticated, recoverable onboarding flow that verifies the person through the approved provider and registers the selected `mv1` through an authorized registrar. Enable trading only after the required on-chain records are confirmed and the existing RWA eligibility read reflects approval. The user needs neither WE nor MVRK to pay for registrar enrollment.

## Confirmed behavior and unresolved dependency

- Equiteez currently directs users to Mavryk Pro inside WE in BuySellScreen; the primary-sale Start KYC button is disabled.
- The WE Basenet registrar helper uses a separate test registrar key. Its setMember/setMemberKyc batch targets the user's address; the user is not the gas-paying signer. This is not a production KYC service to copy into Equiteez.
- RWA relay submission fails closed on unavailable KYC and rejects a nonapproved wallet. Its cached status reader uses the indexer's active, not expired, not frozen membership predicate.
- The current frontend membership-presence helper is weaker than that backend predicate. A new onboarding screen must not equate an existing member row with current eligibility.
- The admin MembershipKycScenario deploys/configures contracts with admin authority. It does not demonstrate investor verification or enrollment of a Dynamic user.
- Availability of a production provider/registrar onboarding service outside these repositories is **nverified**, not known to be absent. Confirm it before introducing another service or duplicate case store.

## Accepted scope and invariants

- Dynamic supports Gasless only; WE retains its existing Gasless and MVRK paths. This task must not add a Dynamic direct-operation signer or weaken existing KYC gates.
- A newly created Dynamic wallet is a distinct address/account. Do not transfer WE KYC, membership, balances, orders, or Credits automatically; equal emails are not authorization to link accounts.
- Bind enrollment to `(backend environment, chain ID, configured membership contract/registrar, canonical mv1 address)`. The address must match the authenticated RWA wallet; a Dynamic JWT or frontend-supplied email is insufficient.
- The trusted registrar pays its transaction gas. Do not expose registrar keys in the browser, copy the WE test signer, request the user's private key, or require native MVRK/reveal from the user.
- Provider approval, registrar execution, and trading eligibility are different facts. An SDK completion callback, browser redirect, or provider review result alone must never enable trading.
- KYC approval does not waive asset-specific membership tiers, restrictions, token requirements, payment preference, or other trading checks.

## 1. Confirm and reuse the registration path

Before implementation, record a short integration decision with the compliance/registrar owner:

1. Identify the existing verification provider, case/session API, webhook contract, and service that owns the provider relationship. Confirm support for the selected Dynamic address independently of WE.
2. Identify the deployed chain, membership contract, authorized registrar and transaction submitter; document which membership/KYC fields must be written, expiry rules, and handling of later rejection, suspension or renewal.
3. Confirm who pays registrar gas, monitors funds/permissions, reviews exceptions, and handles provider outages. Obtain test credentials and sandbox access without storing secrets in task documents.
4. Confirm retention, access and user-facing disclosures with the owning team; keep identity documents at the provider where its integration allows. Do not infer production approval rules from Basenet `NIL` fields or the test `Starter` tier.

If the service exists, integrate through its API and reuse its case IDs, authoritative status and recovery machinery. If it does not provide the necessary capability, add only the missing authenticated case/session facade, verified decision ingestion and durable registrar worker in the agreed backend owner. A new standalone service is not a default requirement.

Deliverable: named owners, service contract, environment/contract mapping, decision-to-registration mapping, and an explicit list of missing capabilities. Unresolved production provider/registrar availability remains a launch blocker, not a reason to bypass verification.

## . Define the minimal API and persistence contract

The paths below are **proposed semantics, not existing endpoints**. Final names and ownership must follow the confirmed service. Equiteez should use an authenticated facade and must not receive provider admin credentials.

| Proposed operation | Required behavior |
| --- | --- |
| `GET /api/v1/wallets/{address}/kyc` | Return current enrollment case summary, registration progress and separately evaluated eligibility for the authenticated address/environment |
| `POST /api/v1/wallets/{address}/kyc/cases` | Create or return the existing applicable case; require an idempotency key, fix the wallet/network binding server-side and reject a conflicting payload under the same key |
| `POST /api/v1/wallets/{address}/kyc/cases/{caseId}/session` | Resume the owned case or issue a short-lived provider session; expired session tokens must not create a second case or change its address |
| Provider webhook at the owning backend | Verify provider authenticity, correlate the event to the stored case and persist it durably before acknowledgment; not a browser-authenticated approval endpoint |
- Require existing RWA bearer authentication and wallet-path ownership for user operations; check case ownership independently of an unguessable case ID. Reject a forged network/contract/address rather than trusting request data.
- Persist case ID, immutable binding, provider reference, decision/version, registration command ID and state, operation hash when known, timestamps, bounded error/retry information, and optimistic version/lease data needed for concurrent workers.
- Enforce one applicable active case per binding and verification policy/version atomically; repeated clicks, tabs and concurrent requests return that case. Renewal is an explicit new attempt after eligibility/expiry policy permits it, not an accidental duplicate.
- Keep `verificationStatus` (for example required/in-progress/in-review/approved/rejected/expired), `registrationStatus` (not-started/pending/submitting/outcome-unknown/submitted/confirmed/failed), and `eligibility` (approved/not-approved/unknown) separate. Names are proposed DTO values.
- Responses include `caseId`, `walletAddress`, `chainId`, status/version, `pdatedAt`, safe next action, and `retryAfter` when relevant. Unknown upstream/indexer state must not be returned as a definitive rejection or approval.
- Provider session URL/token is short-lived, restricted to the owned case and delivered only to its caller. Do not persist it in analytics, logs or session replay; validate return destinations against an allowlist.
- Define stable machine-readable error codes and safe retry guidance for auth failure, ownership conflict, provider unavailable, invalid/expired session and registration unknown. Frontend must not parse provider message strings.

## 3. Verify provider outcomes and publish registrar writes safely

- Use the provider's documented webhook signature/authentication scheme, applicable timestamp/replay checks and secret rotation; reject unauthenticated or malformed callbacks. Re-fetch the authoritative provider decision when its contract requires it.
- Resolve provider case reference to the stored binding. A webhook cannot choose a replacement wallet, network, membership tier, registrar or contract. Do not trust a browser-supplied approval boolean.
- Deduplicate provider events by their stable provider/event identity, with payload-consistency checks. Use provider version/order guarantees or reconciliation to stop delayed approval from overriding a newer rejection/revocation.
- Persist the accepted decision and registration command atomically, or use the existing durable outbox. A process restart between decision handling and submission must not lose the registration request.
- Assign one stable registration command ID per case/approved decision version/binding. Retries must reuse it; an existing registrar API needs idempotent creation and lookup or an explicit recovery contract before use.
- Before writing, recheck that approval is still current, registrar authority is valid, the target chain/contract matches configuration, and required on-chain membership is not already satisfied.
- Serialize/lease registrar execution as needed for its signing account and manager counter. Reuse the existing trusted transaction submitter rather than implementing a second competing counter owner.
- Persist preparation/submission evidence and operation hash when available. After timeout, crash or lost response, reconcile the original command/transaction before signing a replacement; timeout is not proof of non-injection.
- Track confirmed receipts and the actual membership/KYC postcondition. If writes cannot be atomic, retain per-step progress and resume only missing steps; partial registration must not become approved eligibility.
- Retry transient infrastructure errors with bounded backoff and durable scheduling. Expose unresolved age and an operator reconciliation action; stop automatic retries on permanent authorization/schema/policy failures.
- Later expiry/freeze/revocation must invalidate eligibility and follow the confirmed registrar policy. An old successful case must not automatically overwrite a newer restriction or trigger reapproval.
- Treat this as registrar-authorized execution, not a new user permit sent through the trading relay. Integrate shared recovery primitives from the companion reliability task only where their contracts actually match.

## 4. Connect confirmation to RWA eligibility

- After registration confirmation, refresh through the existing status source and cache-invalidation path; confirm that KYC event invalidation addresses the wallet, not the KYC contract.
- During indexer lag, keep `registrationStatus=confirmed` and eligibility pending/unknown until the existing authoritative read has caught up. Never write a fabricated approval into the cache to unblock UI.
- Expose freshness/progress sufficient for a bounded status poll and explicit retry. Provider downtime, chain confirmation delay and indexer/cache delay need distinct actionable diagnostics.
- Re-evaluate current eligibility on resume and before trading, including expiry/frozen state. Existing relay and contract validation remain authoritative; this task does not replace them with the case's historical decision.

## 5. Equiteez user journey and session boundaries

| UI state | User behavior |
| --- | --- |
| RWA login required | Complete the existing Dynamic wallet-bound login; preserve trading inputs |
| KYC required | Explain the requirement for this `mv1`; start/resume the approved provider flow without asking for WE |
| Verification in progress / additional action required | Resume the same case with a fresh short-lived provider session |
| Under review | Show pending review and refresh guidance; do not request another case |
| Provider approved, registration pending or outcome unknown | Explain registration is processing; keep trading blocked and track the existing command |
| Registration confirmed, eligibility not yet visible | Show updating status; retry the status read without repeating registration |
| Rejected / expired / restricted | Show permitted next steps from the verified policy; do not silently resubmit or clear restrictions |
| Eligible | Refresh trading checks and return to the preserved intent; do not automatically place an order |
- Replace WE-specific KYC instructions only for the Dynamic path; preserve existing WE behavior. Reuse provider-neutral identity and RWA auth from the main integration, not admin email/password linking.
- Snapshot address/network/provider wallet ID/session epoch before opening the provider flow. On switch/logout, dismiss or detach the old flow, discard late browser callbacks and clear visible data; server processing may continue only for its original binding.
- Reload, session expiry or closing the provider modal must not delete or reject a case. After reauthentication, recover it through the authenticated status endpoint. Do not expose a former address's case in the new address's UI.
- Keep receive-address display available under the established product policy, but do not encourage purchasing prepaid Credits before eligibility. KYC completion does not remove the separate Dynamic withdrawal limitation; retain the pre-funding disclosure from the main plan.
- Use safe metadata/error codes for diagnostics; exclude documents, PII payloads, provider session tokens, OTPs and JWTs from logging and replay.

## 6. Delivery and rollout

1. Confirm provider/registrar reuse and API ownership, then publish the concrete DTO/state/error contract and recovery guarantees before frontend implementation.
2. Implement missing backend adapters, durable case/command storage and worker/status integration; add only required migrations and configuration. Keep wallet/user key handling in the existing auth flow.
3. Implement Dynamic onboarding UI and recovery; update the relevant trade/primary KYC entry points without enabling unsupported direct actions.
4. Validate in a provider sandbox and Basenet with a disposable Dynamic wallet, zero user MVRK, funded authorized registrar and real indexer events. Record case/command/operation IDs and outcomes, with no sensitive verification data.
5. Gate new case creation separately from status/reconciliation. Disabling onboarding must not abandon submitted registrar operations or make existing cases unreadable.
6. Before production, confirm provider approval policy, registrar permissions/funding, deployed contract mapping, alert/runbook owners, and rollback behavior. The broader public Dynamic launch also depends on the companion relay reliability task and main wallet/signing integration.

Monitor case-to-eligibility time, provider callback failures, duplicate events, registrar failures/unknown-outcome age, and indexer lag using bounded labels. Maintain an operator runbook for re-fetching provider decisions, locating original transactions and resuming missing work without approving users manually outside the authorized policy.

## Test and acceptance criteria

- [ ]  A new Dynamic user completes verification and becomes eligible without installing WE, exporting a key, sending a direct Mavryk operation, or holding native MVRK.
- [ ]  The confirmed provider/registrar integration and environment mapping are documented; no unavailable external capability is treated as already implemented.
- [ ]  Wrong wallet, network, case owner and forged provider callbacks are rejected; Dynamic OTP/email equality cannot bypass proof of address ownership or KYC.
- [ ]  Duplicate create/session requests, two tabs and create-response loss recover the same case; approved address/network binding cannot be changed by a later request or event.
- [ ]  Duplicate/out-of-order webhooks, later rejection/revocation and worker restart preserve the correct decision and do not enqueue unintended duplicate registration commands.
- [ ]  Registrar timeout before/after injection, lost response, restart and partial writes reconcile the original outcome; unknown status never authorizes blind resubmission.
- [ ]  Provider approval alone, chain submission alone, partial membership and indexer lag never enable trading. A confirmed registration becomes eligible through the existing RWA status path.
- [ ]  Expired/frozen membership, provider/indexer outage and stale frontend member rows remain blocked or unknown as appropriate; historical case approval cannot restore eligibility.
- [ ]  Reload, canceled modal, RWA expiry and account/network switch preserve the original server case and never display or apply its result to another wallet.
- [ ]  Existing WE KYC/trading behavior and separate-account semantics remain intact; no balances, Credits or eligibility are automatically transferred.
- [ ]  No registrar secrets or sensitive verification/session data reach the frontend bundle, logs, analytics or replay; only the minimal short-lived provider session reaches its authenticated user.
- [ ]  Sandbox/Basenet E2E and fault-injection evidence, operational alerts and the recovery runbook are reviewed before production enablement. These checks are planned, not yet performed.

## Exclusions and open decisions

Excluded: account merging, automatic KYC migration, provider-wide identity policy redesign, arbitrary asset withdrawals, new Dynamic direct signing, copying admin deployment/RSA flows, and weakening relay KYC enforcement.

Resolve with the owning team: the production provider/service to reuse; registrar API and idempotency guarantees; approved membership fields/expiry/renewal/revocation policy; data retention/access policy; exact final endpoint names and deployment ownership. Missing answers block dependent implementation or rollout, while provider-neutral UI and contract tests can proceed against explicit mocks.