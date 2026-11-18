Frontend implementation plan, November 5, 2026.

Status: frontend implementation tasks based on the inspected source code and Dynamic documentation. Includes reusable findings from `demo example` and offline challenge-format fixtures. Real Dynamic signatures and deployed end-to-end flows have not been verified; the checks below are planned work.

Scope: changes to Equiteez client code, frontend configuration, SDK integration, API consumption and frontend tests. Server reliability and the complete KYC onboarding flow are owned by separate tasks.

This document retains their frontend integration boundaries and launch dependencies. API examples describe the inspected contract unless explicitly marked as dependent on a future API; they do not imply that the separate tasks are implemented.

Confirmed product decisions:

- WE and Dynamic represent separate wallets and separate RWA accounts. Assets, KYC, orders, and Credits are not transferred automatically between them.
- **Dynamic supports both Gasless and direct transactions with gas paid in MVRK.** This supersedes the earlier Gasless-only decision.
- WE retains both modes. Selecting Gasless or MVRK changes the execution route for the same selected wallet, not its address, portfolio or RWA account. Switching between different WE/Dynamic keys still selects separate accounts.
- Gasless remains the default payment preference. A mode change requires explicit user choice; never switch an in-flight/unknown action to the other route automatically.

Revisions examined: RWA `develop/e362e62`, Gas Station `1beca25`, Equiteez `6b2036f6`, WE `dfc7e31a`, and demo example `bbd67288`. For the existing gasless integration contract, the English frontend handoff takes precedence over the older `.md` file with the same base name. Section 15 explains how to apply the demo example findings.

## 1. Frontend flow and service boundaries

Implement two wallet adapters behind one client interface and select an executor from the reviewed payment mode. Dynamic creates/restores an embedded ed25519 wallet; Equiteez derives its Mavryk `mv1` and signs the existing RWA login challenge. Gasless signs a permit and submits through RWA. Direct MVRK execution signs a normal manager operation through a custom toolkit signer and submits to Mavryk RPC. Both routes use the same Dynamic key/address. The direct route is frontend-to-RPC work and adds no Dynamic-specific transaction endpoint to RWA.

```
User selects WE / Dynamic
  → selected wallet adapter → public identity + signing readiness
  → wallet-bound RWA login → eligibility / funds checks
  → reviewed intent + selected payment mode
      ├─ Gasless: PACK permit → sign → local verify → RWA relay
      │            → RWA operation ID → REST / WebSocket tracking
      └─ MVRK: estimate / prepare → forge → sign manager operation
                   → preapply / RPC injection → operation hash tracking
  → confirmed result → refresh portfolio, orders and balances

Gasless execution boundary: RWA → Gas Station → Mavryk contracts
MVRK execution boundary: selected wallet signer → Mavryk RPC → contracts
```

In **Gasless** mode, the client signs a permit; Gas Station submits the manager transaction and pays network gas. A Dynamic address can use this route with zero MVRK, subject to token balances, eligibility and service Credits. In **MVRK** mode, the client's toolkit prepares and injects a manager operation signed by Dynamic; the selected address funds network fees, any required reveal, storage/allocation burn and native transfer amounts. Credits do not pay these direct costs.

Dynamic supplies keys and signing for its Tier-2 model. The App owns Mavryk address handling, RPC integration, state and mode selection. The official Mavryk guide, checked on November 5, 2026, includes direct transfer through a custom signer; use it as API guidance, not proof that the Equiteez integration is already implemented.

Use the existing RWA auth and relay contracts. Keep sponsor credentials outside the client. Server implementation and KYC registration are external dependencies described in section 10.

## . Frontend change map

| Equiteez area | Current constraint | Frontend task |
| --- | --- | --- |
| WalletProvider | Coupled to Beacon/DAppClient | Add provider-neutral identity/capabilities and WE/Dynamic adapters |
| AuthProvider | Creates a separate WE client when signing | Use the active adapter for the existing RWA challenge/verify flow |
| UserProvider | Logs out an account that is connected but not yet RWA-authenticated | Separate restoration, provisioning, wallet-ready and RWA-authenticated states |
| Trading | Uses a direct batch with operator add/remove | Share intent validation, add the Gasless executor and connect existing direct builders to the selected wallet toolkit |
| Profile | Must respect provider capabilities and saved preference | Offer Gasless/Credits and MVRK for both wallets; freeze mode per attempt |
| Portfolio/funding | Some guards read the Beacon account | Use selected Mavryk identity and apply provider-aware action availability |
| Tracking | Must survive lost responses and identity changes | Persist attempt metadata, scope caches/events and consume the recovery contract |
| KYC entry point | Trading screens refer users to WE | Connect to the separately delivered Dynamic KYC flow and refresh eligibility on return |
| Dynamic examples | RWA/demo examples use SDK 4.84.0; demo example framing differs | Reuse verified SDK transport/UI concepts and implement the exact RWA payload builders |

Frontend references: WalletCore, auth helper, UserProvider, direct buy batch, RWA Dynamic prototype. Section 15 covers the demo example adaptation.

### First-release capability matrix

| Capability | WE | Dynamic |
| --- | --- | --- |
| RWA challenge/verify login | Yes | Yes |
| Signing a compatible permit | Yes | Yes, after verifying the SDK vector |
| Gasless buy/sell, cancel/refund | Subject to runtime eligibility | Subject to the same runtime eligibility |
| Gasless operator grant and Credits top-up | Yes | Yes |
| Direct submission of an MVRK-paying operation | Existing path | Yes, through a custom Dynamic signer and toolkit RPC path; requires MVRK and verified action coverage |
| Portfolio, history, receiving address | Yes | Yes, using the derived `mv1` |
| Incoming Ethereum→Mavryk bridge | Existing flow | After replacing the Beacon destination guard; an external Ethereum wallet signs, and its gas is not sponsored by this flow |
| Outgoing transfer/withdrawal | Existing separate paths; verify enabled asset/action coverage | Direct MVRK path after each flow is connected/tested; Gasless still requires a dedicated supported relay action |
| Outgoing Mavryk bridge | No submit flow found in the inspected App | Remains unavailable until separately implemented and verified; a direct signer alone is insufficient |
| Primary purchase | Governed by its own integration contract | Validate the existing direct builder for MVRK and supported launchpad permits for Gasless separately; do not infer support from secondary trading |

Resolve capabilities by provider, payment mode and tested action. Dynamic can sign both domains; enable a direct action only after its toolkit path is integrated and tested. Do not use `walletProvider` metadata as proof of authorization; the existing API is based on key ownership. The same address controlled by the same key remains the same cryptographic account when connected through another method. A newly generated Dynamic key normally produces a different address.

## 3. Dynamic: configuration, SDK, and wallet creation

### 3.1. Choose one SDK generation

Both examined playgrounds use the `4.84.0` package family: `@dynamic-labs/client`, `@dynamic-labs/web-extension`, and `@dynamic-labs/solana-extension`. The demo example has a lockfile with exact resolved versions. The official Mavryk guide already uses **`@dynamic-labs-sdk/client`** and a different API:

- Earlier API: `client.wallets.signMessage({ wallet, message })` → `signedMessage`.
- Current guide: `signMessage({ walletAccount, message })` → `signature`.

**Adjustment after examining the demo example:** run the first compatibility spike on its pinned **4.84.0** baseline to reuse the existing SDK transport and separate the auth-framing change from an SDK migration. Moving to the new namespace is not a prerequisite for the Gasless integration itself. After the spike, explicitly choose the production SDK: retain the exact-pinned baseline if it meets support and environment requirements, or migrate separately to the current generation using the same vectors/E2E checks. Until then, the choice remains open.

The demo example lockfile pins `@dynamic-labs/{client,react-hooks,solana-extension,web-extension}=4.84.0` and `@solana/web3.js=1.98.1`; SolanaExtension requires that exact peer. The older `react-hooks` declares React `>=18 <20`, so React 18 is allowed by its peer metadata. This does not prove Remix/SSR/browser compatibility. Do not mix imports and result shapes from the two generations or transplant the example application's entire React 19/TS6/Vite7 stack. The creation/OTP examples below that use the new namespace apply to the migration option; baseline equivalents are listed in §15.

The Mavryk guide confirms the SOL ed25519 root key → `mv1` model and the SDK's base58 signature output. This is documentation, not an executed test of a particular version. Mavryk guide.

### 3.2. Frontend configuration and required environment inputs

Obtain the following confirmed settings from the Dynamic Console owner before E2E testing, and wire the public configuration into Equiteez:

1. Embedded wallets with an ed25519/SOL root wallet; EVM/BTC wallets are not needed for this task.
2. Email OTP as the initial login method; social/passkey login can be added without changing the permit protocol.
3. Allowed frontend origins, redirect URLs, enabled login methods, and the chosen MFA/password/recovery policy.
4. Confirmation that raw signing is available in the chosen version/configuration and all required browsers.
5. A public environment ID in client configuration. demo example/API secrets and the sponsor key remain exclusively on their respective server sides.

In Equiteez, load the SDK only in the browser, with one instance per page. For Remix, prevent `window` access during SSR, hydration races, and duplicate initialization through the error/maintenance provider tree. Prefer an explicit sequence: create client → add embedded SOL extension → initialize → wait until ready. Current documentation covers both automatic and manual initialization; choose the exact call signature from the installed types. Client creation, initialization.

For the migration option using the new SDK generation, the embedded-only `addWaasSolanaExtension` from `@dynamic-labs-sdk/solana/waas` and an enabled SVM chain in Console are sufficient. Do not add external Solana wallet discovery without a separate product requirement. Solana extensions.

The 4.84.0 baseline uses `WebExtension()` + `SolanaExtension()` from the demo example. Successful OTP verification does not establish that the signing iframe is available. Check the exact dev/staging/prod origins, including ports, Dynamic Console permissions, and a compatible application CSP; signing must work without `dev-tools/csp-bypass`. Pin the development port with `strictPort` so an automatic switch to another port does not break the allowlist. Distinguish iframe/CSP errors from an incorrect OTP and avoid an endless spinner.

### 3.3. Initial creation and subsequent login

Recommended mode: **explicit creation after login and after checking existing wallets**, with auto-create disabled in Console. This provides a distinct creation state, limits provisioning to SOL, and enables controlled recovery after a timeout.

Sequence:

1. The user selects Dynamic; the App records the provider and a new session epoch.
2. Initialize Dynamic and check for a restored session. If none exists, display email → OTP → any required MFA/device/recovery steps.
3. Wait until wallet-account restoration completes. An empty list while loading does not mean the wallet is absent.
4. Find the **embedded SOL wallet** belonging to the current Dynamic user/environment by its selected wallet-account ID. Do not pick the first arbitrary `chain === 'SOL'` match.
5. If the authoritative wallet-account list from the Dynamic SDK confirms that the required account is missing, create only SOL. The current quickstart describes `getChainsMissingWaasWalletAccounts` and `createWaasWalletAccounts`; filter the required chains for this use case.
6. Protect creation with single-flight handling against duplicate clicks/effects. After a lost response, reread accounts before creating another key. Coordinate creation between tabs and reread the Dynamic wallet-account list before another creation attempt.
7. If several suitable accounts exist, use the saved ID or require an explicit selection. Never switch keys silently.
8. Check that the key material is ready for signing; if it is locked or requires a password/MFA, show the corresponding SDK flow.
9. Obtain the public identity, derive `mv1`, and perform RWA login.

Automatic creation at signup is also possible, but it must not be combined with an unconditional manual `createWallet` call. Another device must restore **the same** wallet account rather than generate a new one. Embedded wallet quickstart.

For email authentication, the current documentation describes `sendEmailOTP({email})` → retain `otpVerification` → `verifyOTP({otpVerification, verificationToken})`. An invalid/expired code, resend cooldown, and rate limit are separate states. When explicitly signing in with a **different** email, end the previous Dynamic session first: for an already authenticated user, `verifyOTP` can link the email to the current account instead of switching users. Ordinary restoration of an existing session does not require logout. Email authentication.

### 3.4. Address and public key

```
pk32        = base58_decode(dynamicSolWallet.address)      // exactly 32 bytes
publicKey   = Base58Check(EDPK_PREFIX || pk32)              // edpk...
walletMv1   = Base58Check(MV1_PREFIX || BLAKE2b-160(pk32))   // mv1...
```

Use Mavryk encoding utilities and check them against backend vectors. Do not replace BLAKE2b configured for a 20-byte output with a truncated 32/64-byte hash. Do not replace the textual prefix of a Solana address with `mv1`. Here, the Solana base58 address contains the public key; it is not a Mavryk receiving address.

The App displays and copies **the Mavryk `mv1` and the correct network**, fetches balances/portfolio/KYC for that address, and uses it in RWA URLs. The SOL account address remains an internal root-key identifier. Read the Mavryk chain ID from trusted configuration/RPC and check it against the expected network; the Dynamic SOL network does not select the Mavryk network.

### 3.5. Recovery and security

Dynamic login and access to key signing are separate readiness checks. Email login does not establish that the wallet is ready. After restoration, recheck the wallet ID, public key, and derived address.

Implement the SDK password/recovery UI, logout, and a verified login-restoration flow on another device. In the new-generation documentation, `getWalletRecoveryState` reports ready/encrypted but does not establish that a backup exists. For baseline 4.84.0, implement the same readiness/recovery requirements through that version's API; do not assume that a method with this name exists. If the product offers backup/export, use Dynamic's secure UI; never put keys in React state, localStorage, the backend, analytics, or logs. Export is not needed for ordinary trading. Wallet backup & recovery.

### 3.6. Dynamic signer for direct MVRK operations

Use Equiteez's installed `@mavrykdynamics/taquito` 20.1.0 interfaces for the initial integration. The official Dynamic guide demonstrates the equivalent custom-signer approach with `@mavrykdynamics/webmavryk`; it does not require migrating Equiteez's entire toolkit family. Keep that migration separate from the Dynamic SDK-version decision and declare directly imported utility/crypto packages explicitly.

Create a fresh, browser-only `MavrykToolkit(approvedRpc)` for the immutable selected wallet ID/public key/address/network/epoch and call `setSignerProvider(dynamicSigner)`. Do not install Beacon on it or recycle the WE toolkit. In the inspected SDK, the default wallet provider delegates `wallet.at/batch/transfer` to the configured RPC signer, so existing business-action builders can be reused. `wallet.pkh()` caches its address, and clearing the wallet provider with `undefined` does not reliably remove an already installed Beacon provider; rebuild the instance on an identity/network change.

Implement the toolkit `Signer` contract:

- `publicKey()` returns the selected `edpk`; `publicKeyHash()` returns its `mv1`.
- `secretKey()` returns `ndefined`; ordinary direct signing needs no key export.
- `sign(bytes, watermark)` returns `{ bytes, sig, prefixSig, sbytes }` in the installed SDK's types. Bind the specific Dynamic wallet; verify the identity before and after every SDK await.
- For the direct manager-operation path, validate the expected `3` watermark and allowed operation contents. Reject unexpected signing domains instead of treating arbitrary bytes as a reviewed transaction. Keep the permit/auth method separate.

```
forgedBytes = hexDecode(bytes)                 // branch + manager contents
digest      = BLAKE2b-256(03 || forgedBytes)
sig64       = Dynamic_raw_Ed25519_sign(digest)
             → verify locally against digest and selected pk32

return {
  bytes:     originalForgedHex,
  sig:       Base58Check(SIG_PREFIX   || sig64),
  prefixSig: Base58Check(EDSIG_PREFIX || sig64),
  sbytes:    originalForgedHex || hex(sig64)
}
```

The watermark is included once in the signing preimage, never in injected `sbytes`. Check valid hex, digest/signature lengths and local verification before returning. Reuse the same verified `signDigest32(selectedWallet, digest)` transport as Gasless, but use a different payload builder: complete PACK bytes for permit/auth versus `03 || forgedBytes` for direct operations. Do not send an Ed25519 digest through a second hashing signer or reuse an RWA login signature.

The toolkit handles estimate/prepare, required reveal, manager counters, branch, forging, preapply and injection. It does not provide the product's review screen, identity guards, cross-mode locks or durable browser recovery; implement those around it. Inspect the final prepared contents against the reviewed intent, allowing only expected reveal/fee/counter/branch fields. Never sign an unvalidated opaque payload supplied by an unrelated prepare endpoint.

References: installed Signer interface, default wallet provider, sign/preapply/inject, existing Beacon attachment. These are inspected interfaces, not a completed Dynamic integration.

## 4. Shared wallet interface and states

The following is a proposed application contract, not a completed SDK implementation:

```tsx
type WalletIdentity = {
  provider: 'mavryk_extension' | 'dynamic';
  providerWalletId: string;
  address: string;                 // Mavryk address, not SOL address
  publicKey: string;               // canonical Mavryk key
  chainId: string;
  environment: string;
  epoch: number;
};

interface PermitWalletAdapter {
  getIdentity(): Promise<WalletIdentity>;
  ensureSigningReady(): Promise<void>;
  signPackedMicheline(input: {
    packedHex: string;             // complete PACK bytes, including the initial 05
    expectedIdentity: WalletIdentity;
    purpose: 'login' | 'permit';
  }): Promise<{ publicKey: string; signature: string }>;
  disconnect(): Promise<void>;
}
```

Keep `PermitWalletAdapter` focused on login/permit signing. Add a separate direct executor backed by the selected wallet's toolkit; Dynamic exposes `canSendMavrykOperation=true` when that executor is enabled and verified. Track supported actions per mode rather than treating this boolean as universal contract support. Shared buy/sell logic must not depend on `BeaconWallet`, Dynamic SDK types or the OTP UI.

Freeze `{ identity, paymentMode, intent, attemptId }` before signing. Use a discriminated operation reference: Gasless carries the RWA operation ID; direct MVRK carries the chain operation hash. Direct execution never enters the RWA relay polling path, and a missing RWA ID does not mean a direct operation was lost.

```
disconnected
  → provider-authenticating
  → restoring-wallet / provisioning-wallet
  → wallet-locked / MFA-required (when needed)
  → wallet-ready
  → rwa-authenticating
  → authenticated
  → checking-eligibility → needs-KYC / needs-trade-funds
  → selected mode: needs-Credits (Gasless) / needs-MVRK (direct) / ready-to-trade
```

Each network step has loading, cancellation, and recoverable-error states. Recovery and SDK errors must not trigger another key generation. Cancelling login does not delete the wallet.

On a wallet/network/environment switch:

- Increment the epoch, cancel unsubmitted steps, and ignore late asynchronous results.
- Check identity before and after signing, and again before POST.
- Clear the previous identity's RWA tokens/query cache/socket subscriptions.
- Restore the new wallet's operation list.
- Already accepted operations for the old address continue on the server, but their events must not appear in the new address's portfolio.
- Do not treat disconnect as cancellation of an on-chain or queued operation.

Minimum cache key: `(backend environment, chainId, mv1 address)`. Signing requests additionally include wallet-account ID/provider/epoch. Public operation data may be retained for recovery; never write still-valid signed permits to telemetry or session replay. Separate the sensitive signed payload used for retries from durable recovery metadata/locks. Clear the signed body according to the retention policy, on logout, and when it is no longer needed; retain unresolved-attempt metadata for recovery under the original account after expiry, logout, or a transport-related terminal error. An expired deadline or changed on-chain counter does not prove this attempt was never executed. If the body is no longer available, do not request a new signature without reconciliation.

## 5. RWA login through Dynamic

The Dynamic session provides access to the embedded wallet. **The RWA session proves ownership of the Mavryk address.** Do not send a Dynamic JWT in place of an RWA JWT to protected APIs.

### 5.1. Challenge

```
POST /api/v1/auth/challenge
Content-Type: application/json

{ "walletAddress": "mv1..." }
```

Response: `{ challenge, nonce, expiresAt }`. Do not construct the challenge on the client or change its text. Backend default TTLs: challenge 5 minutes, access token 15 minutes, refresh token 30 days; check the actual environment configuration.

### 5.2. Exact login-signature bytes

The existing RWA contract intentionally uses double encoding:

```
textHex    = lowercase_hex(UTF8(challenge))
authPacked = PACK_Micheline_string(textHex)
           = 05 || 01 || uint32BE(byte_length(UTF8(textHex))) || UTF8(textHex)
digest     = BLAKE2b-256(authPacked)
signature  = Ed25519.Sign(dynamicRootKey, digest)
```

This is not `UTF8(challenge)`, `PACK(challenge)`, or the generic `05 || text` example from wallet documentation. The shared adapter receives **authPacked**. The Dynamic adapter hashes it once and passes the digest through a verified raw-signing API; WE uses MICHELINE with the complete packed bytes.

### 5.3. Verify

Before sending the request, locally check `Ed25519.Verify(signatureRaw, digest, pk32)` and that the key corresponds to the selected `mv1`.

```
POST /api/v1/auth/verify
Content-Type: application/json

{
  "walletAddress": "mv1...",
  "publicKey": "edpk...",
  "signature": "edsig...",
  "nonce": "<nonce from the challenge>",
  "format": "micheline_string",
  "walletProvider": "dynamic"
}
```

The backend also accepts raw ed25519 keys/signatures for authentication, but consistently normalizing them to `edpk`/`edsig` is simpler in the App. Raw hex is not a universally accepted relay wire format.

On success, RWA returns `{ accessToken, refreshToken }` and creates a user if the address has not been seen before. Creation does not depend on a Dynamic webhook. The challenge is single-use; request a new one after a genuine signature failure or expiry. If the verify response is lost, the nonce may already have been consumed: recover login with a new challenge instead of endlessly repeating the old verify request.

Keep the existing RWA refresh/revocation flow. RWA access-token expiry does not require deleting the Dynamic wallet; Dynamic session expiry does not cancel an already submitted relay. A full Sign Out must end both sessions and clear address-scoped data. `walletProvider` is metadata, not proof of authorization.

Always clear local identity/tokens/cache even if one provider's remote logout fails, using `finally` or independent cleanup steps. Surface a server-side revocation failure separately and do not claim the session is guaranteed to be revoked. Retain durable metadata for ambiguous submissions under their original identity according to §4/§9.

## 6. Eligibility integration and funding UI

### 6.1. KYC entry point and status boundary

The complete Dynamic KYC journey, including its provider UI, case lifecycle and registrar integration, is owned by the separate KYC task. This plan owns only the connection between wallet/trading screens and that delivered flow:

- Fetch eligibility for the selected `mv1` and network after RWA login. A new address does not inherit WE KYC, membership, balances, orders or Credits.
- Route Dynamic's KYC entry point to the agreed onboarding module; do not direct this user to install WE. The current BuySellScreen uses WE-specific instructions and PrimaryPurchasePanel has a disabled Start KYC action.
- Preserve the trading form while onboarding is pending. On return, re-read authoritative eligibility for the same identity; an OTP, modal completion or browser callback is not approval and must not place an order automatically.
- Keep pending, rejected, expired/restricted and unknown eligibility distinct. Do not use mere member-row presence as proof of current approval; the frontend helper is weaker than the backend eligibility predicate. Account switches invalidate old UI callbacks and query data.
- Until the separate integration is available, show an explicit unavailable/pending state and keep affected trading disabled. Do not invent KYC endpoints or bypass the existing gate.
- Do not encourage purchasing prepaid Credits before eligibility. Registrar enrollment requires no user MVRK; no registrar key or test signer belongs in the frontend.

### 6.2. Trading funds and supported actions

Receive USDT/RWA at the Mavryk `mv1` on the selected network. An incoming transfer does not require an outgoing user operation. Show the verified token contract/token ID and network, not the SOL receiving address. Do not assume that the Dynamic funding widget is automatically compatible with Mavryk.

The existing Receive UI can be reused with a provider-neutral `userAddress`. An incoming Ethereum→Mavryk bridge transfer also does not require the Mavryk recipient's signature: a separate Ethereum wallet signs on the source side and pays source-chain gas. Replace the Beacon-specific destination guard with the selected Mavryk identity. The current Sepolia→Basenet configuration is not evidence of a production bridge; do not describe the deposit as entirely free.

Check trading funds and applicable protocol fees in both modes. Gasless additionally checks Credits/free allowance and any explicit top-up amount; MVRK checks the native budget from the prepared direct operation. Do not subtract purchased Credits from USDT twice or require Credits for a direct trade. A zero MVRK balance permits the Gasless route only when its other checks pass. Display/refetch native balance without converting an RPC error into zero, and allow receiving MVRK at the same displayed `mv1`.

Connect the existing WithdrawFundsModal to the Dynamic direct toolkit, with recipient/token/native-budget validation and explicit MVRK consent. Native send-all must reserve all fees/burns rather than submit the full balance. Enable other implemented direct actions only after their provider assumptions and transaction results are tested; a missing outgoing bridge flow remains separate work. A direct-only action must visibly request MVRK approval even if the profile default is Gasless; it must not silently change the saved preference.

RWA still has no universal Gasless withdrawal intent: the top-up permit does not authorize an arbitrary recipient. Until a given outgoing action is wired and tested, show its limitation before funding. A different WE account cannot withdraw the Dynamic address's assets; choosing MVRK on the same Dynamic wallet can use an implemented direct withdrawal without moving keys/accounts.

## 7. Building and signing a permit

### 7.1. Preparing a shared intent

Create one normalized intent from the form: contract, token/currency, amount, price, expiry and order flags. Use shared functions to validate decimals, tick size, min/max, balance and KYC. Build the UI summary and Michelson action from **this same immutable intent**.

Use decimal strings/BigInt for nat and token units. Do not use floating point for user amounts. In particular, do not copy `Number(counter)` from the GS helper without a range check: the new shared builder must preserve nat precision.

RWA does not compare every numeric buy/sell intent field bit-for-bit with the action: current checks mainly bind the variant, contract and allowed addresses. Therefore, do not rely on the backend as a complete check that the displayed price matches the signed data. The shared frontend builder and its tests must guarantee this correspondence.

### 7.2. Data immediately before signing

1. Use a fresh `/relay/config` to check the action/contract, tariff and collector/token for a top-up.
2. Read the saved `payment_method`; gasless submission is allowed only with `gasless`.
3. Check that there is no unresolved operation for this signer/contract and that the identity has not changed.
4. Fetch the chain ID from RPC and compare it with the expected network.
5. Read the `%action` type and the presence of `%deadline` from the live script/entrypoint. For the first Dynamic version, support deployments with deadlines; do not guess legacy behavior.
6. Read `getCounter(signer)`/the current contract view. The counter belongs to `(chain, contract, signer)`, not to the user globally or to manager operations. Do not replace an RPC error with zero.
7. Choose one deadline with second precision. Proposed frontend policy: 10 minutes from an agreed current time; this is a product setting, not an existing protocol rule. If clock skew is significant or a prompt stalls, reread the data and request a new signature.
8. Show the variant, contract, amounts, operator/collector, authorization expiry and service cost. Consent in the App is required even if the embedded signer does not display a separate window.

The ABI may be cached by environment/chain/contract/code hash. Reread the counter for each step after the previous confirmation. Configuration, views and counters must not come from a different network or an old wallet epoch.

### 7.3. Cryptographic formula

For the current deployment with deadlines:

```
actionPacked = PACK(action, liveActionType)
actionHash   = BLAKE2b-256(actionPacked)

permitPacked = PACK(
  ((chainId, contractAddress), (counter, (actionHash, deadline))),
  pair (pair chain_id address) (pair nat (pair bytes timestamp))
)

digest       = BLAKE2b-256(permitPacked)
sig64        = raw_Ed25519_sign(digest)
signature    = Base58Check(EDSIG_PREFIX || sig64)
```

There are two distinct hashes: the action hash inside the permit and the digest of the entire packed permit for Ed25519. The protocol requires this. A “double hash” error means hashing the already computed **digest** again when passing it to the signer.

The complete `permitPacked` already contains the initial `05` from PACK. Do not add a second `05`, or use the transaction watermark `03`, EIP-191/personal_sign or a text envelope. Do not sign 64 UTF-8 hex characters instead of 32 digest bytes.

In the current Dynamic API, the official example passes `message` as a hex string. The adapter must prove through a test that the selected version interprets it as the required raw bytes. Decode the returned base58 signature, check that it is 64 bytes long and verify it locally **before** POST. Then encode `edsig` using the standard Mavryk helpers. A local verification failure stops the flow rather than starting a relay.

The WE adapter passes the complete packed bytes with `signingType: MICHELINE`. Beacon `RAW` is unsuitable here: the extension adds its own signed-message envelope. With MICHELINE, WE separates `05` as the watermark and reconstructs the same hash input. See WE signing rules.

The formula is supported by the GS encoder and contract permit helper. A separate E2E test against the actually deployed version is required.

### 7.4. What is and is not signed

| Data | Included in the cryptographic signature |
| --- | --- |
| Action: quantities, price and its other contract fields | Yes, through the action hash |
| Chain ID, target contract, permit counter, deadline | Yes |
| RWA `intent` metadata as separate JSON | No; it must come from the same action intent |
| `idempotencyKey`, RWA operation ID | No; these control off-chain delivery |
| Future service tariff/credit debit | Not automatically; a separate off-chain GS policy |

The current permit does not lock the service tariff between review and enqueue. Reread the tariff before signing/POST and do not promise a fixed charge unsupported by the API. Do not change the action after signing.

## 8. Payment-mode selection and transaction execution

### 8.1. Mode selection and Gasless preflight

```
selected signer ready + RWA JWT for this mv1
  → KYC / membership / trading eligibility
  → confirmed saved preference = gasless
  → fresh relay config / supported contracts/actions
  → fee credits and trade funds
  → recovery of pending/unknown operations
  → review intent
  → execute steps sequentially
```

For both Dynamic and WE, show Credits/Gasless and MVRK in Profile and save through the existing versioned preference API. Respect a stored `mvrk` value; do not overwrite it at login. A failed preference GET is unknown, not permission to choose a mode. New gasless submission requires saved `gasless`; a direct trade follows saved `mvrk` and its own native-budget checks. The sequence above and sections 8.2–8.6 describe Gasless; section 8.7 describes direct MVRK.

A preference change affects future attempts only. During a relay outage, the user may explicitly choose MVRK for a new reviewed action if no matching prior action is pending/unknown and direct checks pass. Never automatically fall back or silently reinterpret an already signed permit as a direct operation. Changing payment mode on Dynamic keeps the same account; switching to a different WE key does not.

### 8.2. Credits top-up when needed

1. Read runtime `fee.enabled`, fee token/ID/decimals, collector, bounds, fee schedule, `actionsRemaining` and `freeAllowanceRemaining`.
2. If a successful response confirms `fee.enabled=false`, no top-up is needed. A `503`, timeout or stale tariff does not mean fees are off.
3. `actionsRemaining[variant]` already includes the free allowance. Do not add buy and sell allowances together or add the free allowance again. A variant without a price must not be blocked by an overall zero Credits balance.
4. If a top-up is needed, show the exact fee-token amount and the rule: purchased Credits cannot be withdrawn back into tokens. Returning a service charge to the credit balance after a failed order is a separate event and depends on the accounting/refund policy. At a price of `P` raw units per action, purchasing capacity `N` requires `N × P`; do not hardcode 1 USDT or treat one raw unit as one Credit.
5. Build `permitTransfer` for **fee.tokenContract**, with the correct token ID, owner=selected `mv1`, recipient=**fee.collector** and exact amount. Obtain the schema, action hash, token counter, chain ID and deadline as above.
6. Sign, verify locally and submit:

```
POST /api/v1/wallets/{mv1}/relay/fee/top-up
Authorization: Bearer <RWA accessToken>

{
  "publicKey": "edpk...",
  "signature": "edsig...",
  "amountUnits": "20000000",
  "deadline": "<the same signed RFC3339 timestamp>"
}
```

- `0000000` is only an example of raw units; the value depends on decimals/price. The deadline must be RFC3339 with an offset and seconds; a bare epoch string is not accepted by this API.

The `202` response is `{ operationId, gasStationOperationId, signerAddress, amountUnits }`, **without `status`**. Save the ID immediately, GET the full RWA operation, wait for `confirmed` and reread credits/token balance. Until the credit read catches up with confirmation, show an updating state rather than crediting the amount locally.

The top-up API does not yet accept a client idempotency key. Do not automatically repeat POST after a timeout. First recover through GET/list and inspect the existing operation. If no ID was received, inspect recent operations across all statuses with pagination; an open-only list may omit a top-up that has already completed. Matching amount/time does not prove that it is the same attempt. `PERMIT_IN_FLIGHT` may refer to an operator grant rather than this top-up. If no unambiguous match can be established, retain the lock and escalate the case for server-side reconciliation. The inspected API does not provide lookup by client attempt ID. The separate reliability task supplies the new top-up key/recovery contract. Once that contract is delivered and enabled in the target environment, send a stable `idempotencyKey` and use its documented recovery behavior. Do not assume that field is supported by the current example above. A new signature and a new purchase are prohibited until the previous outcome is resolved.

### 8.3. Buy/sell

```
top up the quote token if needed
  → confirmed + credits refresh
  → check the operator on the required token
  → if absent: permitUpdateOperators → confirmed
  → fresh orderbook counter + review current conditions
  → permitPlaceBuyOrder / permitPlaceSellOrder
  → RWA accepted → GS progress → chain confirmed
  → refresh orders/balances/history/credits
```

Buy: authorize the orderbook to spend the quote token. Sell: authorize the orderbook to spend the RWA token. The operator grant in this gasless flow is **persistent**; there is no automatic revoke after the order. If it already exists, skip the step. Explain the persistent authorization to the user, especially during first-use confirmation.

If `fee.tokenContract` matches the trade quote token, the top-up and buy operator grant use the same permit counter. Serialization is always bound to the actual target contract; if the fee/trade tokens differ, their counters are independent, but the first version still executes this plan sequentially. Do not sign steps in advance or submit them in parallel. Each next step starts only after `confirmed`, not after just any terminal status. `failed/rejected` stop the plan. After setup, recheck the balance, preference, freshness of conditions and whether the trade itself is still needed.

Typically, a new wallet with sufficient Credits signs grant + order; adding a top-up makes three signatures. A returning wallet with an existing operator grant and Credits signs one order. Login/MFA signatures are counted separately. Do not forward the entire direct WE add→trade→remove batch to the relay.

### 8.4. Cancel/refund

Cancel/refund do not require an operator grant. The standard tariff treats them as free, but the runtime schedule remains the source of truth. Cancel combines up to 10 orders from one orderbook into a single action; refund uses the current typed multi-order API and the separate refund-all handoff. Check ownership/claimability; do not promise that cancellation automatically returns funds if the contract requires a separate refund.

### 8.5. Ordinary submission to RWA

```tsx
// Request structure; operation is built by the actual schema encoder.
{
  intent: {
    kind: 'place_buy_order',
    orderbookAddress,
    rwaTokenAmount,       // raw nat decimal string
    pricePerRwaToken,     // raw nat decimal string
    currency,
    orderExpiry,
    isMarketOrder
  },
  operation: {
    to: orderbookAddress,
    amount: '0',
    parameter: {
      entrypoint: 'permitAndExecute',
      value: encodedOneItemPermitList
    }
  },
  idempotencyKey: attemptUuid,
  permitCounter: counterString // diagnostic, not the source of truth
}
```

Endpoint: `POST /api/v1/wallets/{mv1}/relay/operations` with an RWA bearer token. One permit item contains `userPublicKey`, `userSignature`, `action` and `deadline` in the actual Micheline form of the deployed schema. Do not send an arbitrary JSON object instead of Micheline. Use `toTransferParams()`/the encoder without `.send()` and without wallet injection.

One UUID per signed attempt. **Before POST**, save the identity, attempt UUID, payload fingerprint, time and `submitting` state; retain the exact body under the storage policy for a safe retry. A transport retry uses **the same payload and key** and allows recovery of the RWA ID after a lost response, while structural/drain checks permit replay. Changed counter/deadline/action/signature require a new attempt and a new key only after the previous outcome is resolved. `202` returns the RWA `operationId`, upstream ID and status; this is acceptance, not trade completion. If replay is impossible because of an outage/config drift, retain outcome-unknown rather than recreating the intent.

### 8.6. What the frontend can rely on

Consume RWA ownership, schema, eligibility, preference and admission errors through the documented API. **RWA structural checks do not replace local cryptographic verification:** verify the signature before POST, then use RWA status updates to observe GS/chain execution. Success increments the on-chain permit counter; reread it instead of incrementing a local value as the final source of truth. No client call uses the sponsor API key or submits directly to GS.

### 8.7. Direct execution with gas paid in MVRK

```
same selected mv1 + reviewed intent + explicit MVRK mode
  → eligibility / trading funds / direct-action coverage
  → acquire logical-action and account-wide manager-operation locks
  → read branch, counter, reveal and operator state
  → estimate prepared action, reveal, fees and storage/allocation costs
  → native-balance check + user review
  → DynamicSigner signs 03 || forged bytes → local verification
  → toolkit preapply → guarded RPC injection
  → track operation hash → inspect full receipt → refresh application state
```

1. Reuse the existing direct buy/sell/cancel/refund builders with the selected toolkit and the same normalized business intent. These call ordinary contract entrypoints, not `permitAndExecute`. Continue normal RWA login and frontend eligibility checks; direct execution bypasses the relay endpoint, not contract restrictions or KYC. Do not require a healthy relay tariff/config or Credits to execute a valid MVRK action.
2. Read native balance and the current action's token balances. Estimate all manager contents, including a reveal when the account is unrevealed, and include chosen fees, gas limits, storage/allocation burn and any native transfer value. Show MVRK costs separately from trade amounts/protocol fees. Use integer smallest units/decimal strings; do not copy examples using unsafe floating-point amounts or assume the sum of suggested fees includes storage costs.
3. Review the actual account/network, target contracts/recipients, token/native amounts, operator changes, and an estimated/approved native-cost budget. Embedded signing may not show a wallet confirmation UI. If prepared contents, economic values or approved cost bounds change, refresh the estimate and request fresh review. An unavailable estimate/balance is an error, not zero cost.
4. Let the toolkit insert reveal only when necessary and count it in the estimate and receipt. Prior Gasless use does not prove the Dynamic account is revealed. Test the first funded direct transaction and subsequent already-revealed transactions.
5. Preserve operator state across modes. Current direct buy/sell batches unconditionally add then remove the operator, which can remove a persistent Gasless grant. Read the exact owner/operator/token grant: preserve an existing grant; use temporary add→trade→remove only when this action needs to create it. Serialize this App's grant mutations and consuming workflows across both modes by `(chain, owner, token contract, tokenId, operator)`, or use a conservative affected-contract lock. Hold coordination through the workflow's resolved result/state refresh: different logical actions can otherwise race between an absent-grant read and temporary cleanup. Re-read/invalidate operator state after completion before either executor relies on it. Do not infer a permanent grant from an old cache.
6. Capture immutable prepared contents and enforce identity/mode checks around signing and immediately before injection. Use the toolkit's injector extension point to record a deterministic operation hash and final identity check before the RPC call; an SDK `.send()` promise alone is insufficient recovery state.
7. Track by chain operation hash and confirmation policy, then inspect **all relevant manager and internal results** for `applied`. Inclusion/`confirmation()` alone, or only the first batch result, does not establish trade success. A failed/backtracked batch may still incur native fees. Extend seContractAction and its callbacks to carry the hash, unknown-outcome state and verified execution result rather than marking any resolved promise successful.
8. Refresh orders, balances, native balance, operator state and history only from authoritative outcomes/indexer data. Direct execution does not create RWA/GS operation IDs or debit relay Credits. Do not POST the direct operation to the relay to obtain a tracking ID. A transaction being applied still does not mean the placed order is filled.

Action coverage: secondary buy/sell/cancel/refund and the existing withdrawal UI are direct integration targets. Verify the primary-purchase builder against its actual configured deployment and retain its operator/quote checks. Audit DODO helpers before exposing any corresponding action; helpers alone do not prove a live UI exists. No outgoing Mavryk bridge submit flow was found in the inspected App, so a direct-signing capability must not enable one without separate implementation. For native MVRK withdrawal, verify an actual asset-selector entry: a native branch in the handler alone does not make that feature available.

### 8.8. Switching modes without duplicating an action

Share a logical-action lock between both executors and coordinate this application's tabs. These browser locks do not control another device/app and are not a global exactly-once guarantee. On account restoration, load available pending RWA operations and known chain-attempt evidence before permitting a retry; keep any known ambiguous attempt unresolved when evidence is insufficient. A pending/unknown Gasless action must not be recreated as direct MVRK, and an unknown direct broadcast must not become a newly signed permit. These operations use independent replay domains and can both execute successfully; a permit counter cannot deduplicate a direct equivalent.

Direct manager operations additionally serialize per `(chain, source address)` across contracts and tabs. Gasless permit counters remain scoped per `(chain, contract, signer)`. External wallet/apps can still change counters or operator state, so reread and handle conflicts without blind re-signing. For an explicit new attempt after the prior one is resolved, rebuild the selected mode's payload/counters, refresh business state and obtain new consent.

Saving another payment preference does not reroute or cancel an existing attempt. Continue tracking it using its original mode and identity. Direct execution can change balances, orders and operator state relevant to future permits; invalidate those reads before switching back to Gasless.

## 9. Tracking, retry and user-facing errors

### 9.1. Gasless operations

```
signing → submitting → accepted/pending → batched → injecting → submitted
                                                           ├─ confirmed
                                                           ├─ failed
                                                           └─ rejected

POST timeout → outcome-unknown → recovery GET/list
                       └─ must not be treated as permission to submit a new trade
```

Poll the **RWA operation ID**, not the GS ID: every 3 seconds, or every 30 seconds with a healthy authenticated socket. Use `fresh=1` only for an explicit Check now action, respecting the limit. Merge WebSocket `RELAY_OPERATION_UPDATED` by `updatedAt`, deduplicate by `event_id` and do not replace the full REST row with it. A late fee amendment may arrive after a terminal status.

Prod/test share the relay topic. Accept a frame only for the current wallet and an operation ID already known in the current backend environment. Ignore an unknown ID; it is acceptable to refresh the list through the correct REST environment and then continue tracking. Checking only `event_id`/timestamp does not isolate environments.

On reload: list `status=open`, follow pagination and restore locks/tracking. GET saved accepted IDs separately to obtain operations that are already terminal; an open-only list is insufficient for a lost response. Keep a separate durable marker for uncertain delivery until authoritative reconciliation proves the outcome: the current RWA row can become `failed` for a transport reason even when the request was actually accepted (section 10). Do not remove this marker merely because the row disappears from the open list. Do not automatically resume the remaining unsigned steps. After 10 minutes, show “still processing,” not failed. Terminal `confirmed` for a grant/top-up is not confirmation of the order; order placement does not mean a fill.

| Situation | Client action |
| --- | --- |
| User declines in the SDK | Keep the form; do not create a relay |
| Dynamic locked/MFA/session expired | Restore signing readiness, then check identity and payload freshness on return |
| Local signature verification failed | Abort with a diagnostic code; do not submit a known invalid signature |
| RWA `401` | Refresh or request a new challenge; do not switch wallet/provider |
| `SIGNER_MISMATCH` | Clear the inconsistent identity/session and reconnect |
| `KYC_REQUIRED` | Address-specific KYC flow; not an offer to buy Credits |
| `PAYMENT_METHOD_MISMATCH` | Reread the preference and explicitly Save gasless; no silent write |
| `PERMIT_IN_FLIGHT` | Inspect `detail.operationId` and wait for the outcome; it does not prove that the intent matches |
| `IDEMPOTENCY_KEY_REUSED` | Client bug/conflicting attempt; do not blindly retry with a new key |
| `FEE_CREDIT_REQUIRED` | User Credits shortage: refresh/reviewed top-up |
| `RELAY_UNAVAILABLE` | Sponsor/infrastructure/unknown config: Retry; do not demand a top-up. Explicit MVRK selection is allowed only for a fresh reviewed action after any earlier attempt is resolved; no automatic fallback |
| `PERMIT_EXPIRED` / `PERMIT_MISSIGNED` / remedy `re-sign` | Reconcile first, then obtain fresh counter/deadline/conditions and new consent |
| `SIMULATION_FAILED` | Show the normalized reason and refresh the action state; no endless retry |
| `429` | Honor Retry-After; do not automatically bypass limits with a new account |

The relay handler envelope `{error,message,remedy,detail?}` differs from middleware/auth `{error,code}`. Handle both. `remedy=retry` does not turn terminal failed into pending. Safe GET requests may use bounded backoff of 1/2/4 seconds; ordinary POST retries must retain the previous idempotency key; top-ups have separate restrictions.

`feeChargedUnits=null`, `credited_units=null` and `credits_quantity=null` mean the accounting outcome is unknown. Do not show “free,” “1 USDT refunded” or “N Credits credited” based on null/terminal status. Refresh authoritative credits and use a neutral state until data is available. Existing CRED-5 remains a separate task.

### 9.2. Direct RPC submission and recovery

Before the injector sends signed bytes, compute `operationHash = encodeOpHash(sbytes)` using the matching Mavryk utilities and persist non-secret attempt metadata: hash, mode, wallet/environment/chain, intent fingerprint, branch/counter range and submission phase. In the inspected implementation the hash is derived from `BLAKE2b-256(hexDecode(sbytes))`; no `03` watermark is added to the hash input. Verify that the RPC response returns the expected hash. Installed operation-hash helper.

The default toolkit injector does not resolve an ambiguous network failure. Once broadcasting begins, an RPC timeout/connection error, tab close or confirmation timeout means the outcome may be unknown. Retain the hash/lock and reconcile through the selected chain's RPC/indexer, including after reload or returning to the account. A single empty mempool/indexer response or a changed counter is not proof of non-execution.

Rebroadcasting the exact same signed bytes preserves the same hash; if supported, use a bounded retry only within the existing attempt and compatible branch lifetime. Never silently forge/sign a replacement with a new branch/counter/signature. If signed bytes were cleared or their outcome cannot be established, retain a recovery state and require authoritative resolution before a new economic action. Keep signed bytes out of logs/replay, retain only necessary protected retry data and preserve non-secret recovery metadata through logout. A stale branch can stop rebroadcast without proving that the earlier operation was never included.

Distinguish user rejection before injection, insufficient MVRK, simulation/preapply rejection, stale prepared data, broadcast unknown, included-but-failed and confirmed/applied. Only a verified never-broadcast rejection may immediately release this attempt for a fresh review. Use RPC/indexer receipts to resolve accepted/unknown work; do not invent a server recovery endpoint for the direct path. Disable new direct execution separately from reading old operation results.

## 10. External dependencies and frontend integration gates

These are dependencies of the client work, not backend or registrar implementation tasks within this document.

| Separate task | Contract needed by the frontend | Behavior until it is delivered |
| --- | --- | --- |
| RWA / Gas Station reliability | Durable attempt identity, top-up idempotency, exact-attempt recovery and authoritative unknown/resolved outcomes across REST/socket | Retain unresolved metadata and locks; use existing reads and documented ordinary replay only; no blind top-up retry or replacement signature |
| Dynamic KYC onboarding | Delivered onboarding entry point and address/network-scoped eligibility/status contract | Keep the missing/unavailable state explicit and trading gated; no WE redirect or local approval |
| Credits settlement, CRED-5 | Authoritative charged/refunded/credited values and accounting state when available | Null stays unknown; refresh balances and do not infer a refund or credit from terminal status |

Existing browser → RWA ordinary idempotency is useful, but does not prove end-to-end delivery safety. In the inspected version, a transport-related RWA `failed` can coexist with an upstream accepted request. Preserve the frontend uncertainty marker until authoritative reconciliation resolves it; do not release it merely because an operation disappears from an open list.

Obtain the delivered API version/contract and representative responses from the owners of the separate tasks before enabling dependent client behavior. Do not invent endpoint names, status values, feature fields or a discovery API. Add frontend contract fixtures for the agreed responses and gate rollout through the application's supported configuration.

Frontend development and closed testnet signing pilots can proceed with explicit mocks/current API limitations. Public Gasless trading remains dependent on the separate relay reliability and KYC acceptance evidence, including with service fees disabled. Direct MVRK requires its own funded signer/execution/recovery evidence and the same relevant KYC eligibility; it does not depend on Gas Station being available. A combined release must satisfy each enabled route's gates, and any unresolved prior Gasless attempt still prevents a duplicate direct action.

## 11. Frontend implementation plan and dependencies

This section assigns work to Equiteez frontend only. Server delivery guarantees belong to Relay idempotency and timeout recovery. The complete Dynamic KYC journey, including its onboarding UI and provider/registrar integration, belongs to Dynamic wallet KYC onboarding. Consume the agreed contracts from those tasks; do not recreate their implementations here.

### P0. Prove the frontend signing adapter

- Start the compatibility spike with the demo example's exact lockfile dependency set at 4.84.0, a selected embedded SOL account, and a separate test environment. Use a normal browser without a CSP bypass and no real assets.
- Run the offline framing fixtures, then connect the RWA auth builder to the selected-wallet SDK transport. Keep demo example helper, demo example backend and RWA auth framing distinct.
- Prove `pk32→edpk/mv1`, signature decoding and local verification against the expected digest. Record public fixtures with SDK versions, packed bytes, digest, public key, address and signature; exclude private keys, credentials and personal challenge data.
- Use the existing RWA challenge/verify API as a client and record acceptance of a real Dynamic signature. Submit a compatible testnet permit through existing endpoints and observe its operation ID, hash and receipt; validate top-up separately. Prove the independent direct `3` signing domain and toolkit result shape with a funded disposable wallet, including automatic reveal and RPC receipt checks.
- Select the production SDK explicitly after the spike: retain the exact-pinned baseline if suitable, or migrate in a separate step using the same vectors and browser tests. Do not mix SDK generations.

Deliverable: a frontend adapter with demonstrated byte compatibility and API-consumer evidence. Neither the playground source nor synthetic vectors alone establish real Dynamic interoperability.

### P1. Wallet identity, connection and RWA authentication

- Introduce provider-neutral identity/state/capabilities in WalletProvider; retain Beacon inside the WE adapter. Both providers expose permit signing and a direct executor, with per-action coverage. Create a fresh Dynamic toolkit/signer for the selected identity; never reuse a Beacon-bound instance.
- Implement client-only Dynamic initialization, email OTP, deterministic embedded-wallet selection, restoration/creation, wallet-ID binding, locked/MFA/recovery/error states and protection against duplicate creation.
- Use the demo example `WalletStep` stages as reference only. Check existing Equiteez polyfills, SSR imports and a single client/iframe after StrictMode or error-tree remount.
- Inject the selected adapter into AuthProvider instead of creating another `dappClient()`; extend the `walletProvider` union and preserve the existing RWA challenge, refresh and logout protocol.
- Separate wallet provisioning/readiness from RWA authentication in UserProvider. Scope caches, subscriptions and async results by wallet/network/environment/epoch; clear local session data even when remote logout fails.
- Add WE/Dynamic selection and provider-aware Profile controls. Preserve distinct accounts; a saved MVRK preference requires an explicit user change before a Dynamic gasless submission.

### P2. Shared intents, Gasless executor and direct MVRK executor

- Share immutable intent validation, unit conversion, live schema/counter reads, permit packing, `signPackedMicheline` and local verification across WE and Dynamic.
- Build one relay API client and sequential top-up→grant→order executor. Keep the direct executor separate for both providers; never forward a manager-operation batch as a Gasless permit batch. Preserve pre-existing operator grants when alternating modes.
- Snapshot identity and reviewed intent before signing; recheck after async boundaries and before POST. Use fresh counters/deadlines for each step and continue only after its predecessor is confirmed.
- Implement buy/sell, persistent operator reuse, cancel/refund and Credits behavior according to the existing gasless handoff. Review primary purchase separately against its supported permit contract before enabling it.
- Add an identity-bound `DynamicMavrykSigner`, fresh toolkit factory and guarded injector with precomputed operation-hash persistence. Reuse existing direct builders through the selected toolkit; record direct lifecycle separately from RWA relay lifecycle.
- Implement native-cost/reveal/storage estimation and explicit review, manager-counter serialization and cross-mode logical-action locks. Ensure UI handlers never switch route silently after an error.
- Update direct operator handling to preserve a pre-existing grant, then refresh state between modes. Extend direct action callbacks to retain hashes/unknown outcomes and inspect all relevant receipt results.

Proposed modules: `app/services/gasless/{permitBuilder,relayClient,executor}` plus `app/services/direct/{dynamicSigner,toolkitFactory,guardedInjector,executor}` and shared intent/attempt state, following Equiteez conventions. These are proposed paths, not existing files. Do not duplicate business validation into a separate Dynamic buy/sell engine.

### P3. Tracking, recovery and available actions

- Persist attempt identity and unresolved-operation recovery metadata; retain the exact payload/key for retries where the current endpoint supports it. A timeout, expired deadline, closed modal or logout is not proof of non-execution.
- Implement RWA operation polling, socket merge/deduplication, pagination, reload recovery, same-contract locks and the public error/remedy mapping. Preserve current top-up retry restrictions until the separate reliability task supplies a changed API contract.
- Display accepted, setup confirmed, order placed and order filled distinctly. Refresh relevant balances/orders/credits/history; preserve unknown accounting instead of inventing refunds or credited quantities.
- Integrate the KYC task's entry point and address-bound status contract into trading eligibility. Pending/rejected/unknown status blocks the action; this work does not implement a second KYC case, provider flow or approval mechanism.
- Reuse the Mavryk receiving UI with the selected `mv1`; replace the incoming Ethereum bridge's Beacon destination guard with provider-neutral identity. Source-chain signatures and gas remain with the external Ethereum wallet.
- Wire existing withdraw/direct builders to the selected toolkit and enforce per-mode capabilities in handlers and controls. Audit DODO, outgoing bridge and primary purchase independently before enabling them for Dynamic. Explain any remaining coverage limits; separate trading-token, Credits and native MVRK shortages.

### P4. Frontend validation and rollout

- Check the deployed API/config as a consumer: expected chain, supported contracts/actions, deadline ABI, payment preference, fee configuration and availability. Request missing deployment evidence from the owning task; do not infer readiness from merged code.
- Separate frontend flags for Dynamic connection, new Gasless execution and new direct MVRK execution. Expose only integrated modes/actions. Disabling execution must leave each route's status reads and recovery of already accepted operations available.
- Run zero-MVRK Gasless and funded direct testnet pilots, browser recovery/error tests, then a limited rollout. Apply route-specific gates from section 10; for the combined release, obtain both companion tasks' evidence and direct RPC recovery evidence. Test Gasless reliability even with fees disabled.
- Add safe frontend diagnostics for provisioning/sign/auth failures, signing latency, local verification failures and unresolved-outcome age. Exclude OTPs, JWTs, provider session tokens, private keys, signatures and full sensitive payloads from logs/replay.

### Parallel frontend work

| Workstream | Area | Dependencies |
| --- | --- | --- |
| A | SDK spike and wallet/auth adapter | Real SDK vector before final adapter acceptance |
| B | Shared intent + Gasless and direct executors | Agreed signer/toolkit interfaces; A for both real signing domains |
| C | Trading UI, tracking, funding and capability guards | B's state/API contract; KYC task's entry-point/status seam |
| D | Consumer E2E and rollout checks | A+B+C and evidence from the companion tasks |

One workstream owns changes to WalletProvider/UserProvider. Other streams consume its interface rather than editing provider core concurrently. New implementation branches use the `feature/` prefix. This document assigns no server migrations, registrar implementation or Gas Station changes to frontend work.

## 12. Frontend test matrix and readiness criteria

The tests below are **planned**, except for the completed offline synthetic framing experiment in §15. Reading source, producing local signatures or testing against mocks does not prove real Dynamic, deployed backend or on-chain behavior.

| Level | What to prove |
| --- | --- |
| Unit: encoding | `pk32→edpk/mv1`; `sig64→edsig`; auth double encoding; action hash; typed permit/deadline; no extra prefix/hash |
| Independent vectors | For `AB`, distinguish `054142`, `0501000000024142` and `05010000000434313432`; signer and verifier cannot share an incorrect builder without an independent expected vector |
| Negative signatures | UTF-8 hex instead of bytes, wrong key/digest, altered permit fields and truncated signatures fail local verification before POST |
| SDK/browser | The chosen real SDK signs the expected digest and returns the verified encoding; iframe works without bypass; blocked origin produces a recoverable error |
| Build/SSR | Browser globals are sufficient; server imports do not initialize Dynamic; repeated mounts do not create competing clients/iframes; debug body logging is absent |
| RWA auth consumer | Challenge/verify succeeds with a real Dynamic signature; mocked nonce expiry/reuse, wrong-address and auth failures produce the documented recovery behavior |
| Wallet lifecycle | OTP cancel/error, cooldown, delayed wallet restoration, create timeout/double click, multiple SOL wallets, locked/MFA and another-device restore |
| Session boundaries | Switch/logout during prompt or POST never submits an old result under a new identity; local cleanup survives remote logout failure; unresolved metadata stays scoped |
| Execution with API mocks | Ordered top-up→grant→order, grant reuse, failed setup stop, cancel/refund bounds, no premature order success and no automatic direct fallback |
| Amounts/review | Large nat values, decimals, tick rules, zero/invalid amounts, changed quotes, actual fee token and explicit preference changes |
| Recovery with fault mocks | Lost submit response, reload, two tabs, duplicate clicks, delayed terminal updates, missing IDs and stale indexer preserve unknown outcomes and prevent a second intent |
| Tracking | RWA IDs rather than GS IDs, pagination, poll/socket fallback, event deduplication, updatedAt merge and late fee amendments |
| Fees | User shortage differs from sponsor outage; free allowance counted once; unavailable config is not fee-off; null accounting is not a refund |
| Capabilities/funding | Dynamic uses its signer/RPC for MVRK and the relay for Gasless, never Beacon; incoming bridge stops after destination change; unsupported mode/action combinations are blocked |
| KYC integration seam | Mock the companion task's entry-point/status contract; only the current address's eligible state permits continued trading checks; email login is not approval |
| WE regression | Existing login/MICHELINE and direct MVRK paths remain functional; WE gasless uses the same executor cases |
| Direct signer | `03 |
| Direct lifecycle | Unrevealed then revealed account, native fees/storage/transfer budget, preapply error, identity switch before injection, all manager/internal receipt results and indexer lag |
| Direct recovery | Hash persisted before RPC POST; lost response, reload and confirmation timeout retain it; exact-byte retry does not become a freshly signed replacement |
| Cross-mode/account concurrency | This App blocks the same unresolved intent across routes/tabs; manager counters and permission-mutating workflows are serialized; external-device limitations are explicit; existing grants are preserved |
| Native funding/withdrawal | RPC failure is not zero balance; insufficient MVRK blocks direct but not valid Gasless; send-all reserves actual costs; enabled withdrawals check recipient/token and receipt |
| Real consumer E2E | Eligible zero-MVRK Dynamic wallet completes permits; funded Dynamic wallet completes direct actions with/without reveal; verify receipts and revisit the same wallet across mode changes |

```
Login/restore [SDK + component tests]
  ├─ wallet available → RWA auth [API consumer E2E]
  ├─ absent → create once → auth [SDK + E2E]
  └─ locked/error → recovery UI [component tests]
auth → eligibility [API mocks + consumer E2E]
  ├─ KYC blocked → companion task entry point/status
  ├─ preference/funding blocked → explicit frontend recovery
  └─ eligible → sequential plan [unit + API integration]
       ├─ top-up needed → sign → relay → credits refresh
       ├─ operator missing → sign → relay → confirm
       └─ order → sign → relay → confirm/indexer
eligible + MVRK selected → native-cost review [API mocks + consumer E2E]
  → prepare/reveal → sign03 → preapply → inject with saved hash
  → receipt: applied / execution failed / outcome unknown
every sign: identity/payload changed → abort
every POST: unknown outcome → reconcile, without a new action
```

Frontend acceptance criteria:

- [ ]  A user without WE creates/restores the intended Dynamic wallet, sees its Mavryk address and obtains an RWA wallet-bound session after a real signature.
- [ ]  Compatible SDK versions are selected; signing works without CSP overrides; SSR, hydration and repeated mounts are safe.
- [ ]  A real deadline-bearing permit passes local verification and is accepted/executed in the provisioned test environment; evidence is distinguished from mocked tests.
- [ ]  Supported buy/sell/cancel/refund and Credits flows work with zero user MVRK, subject to token/KYC constraints; setup confirmation never displays order success.
- [ ]  Dynamic and WE support Gasless and MVRK; mode selection preserves the selected address/account, while switching to another wallet does not transfer assets/data/eligibility.
- [ ]  A funded Dynamic wallet signs/injects direct buy/sell/cancel/refund through RPC; first-use reveal, storage costs and insufficient-MVRK states are covered. No relay Credits are charged by this route.
- [ ]  Direct operation hash is saved before broadcast; lost RPC/confirmation responses recover by hash, all relevant execution results are checked, and reload never triggers blind re-signing.
- [ ]  This App blocks cross-mode resubmission of a pending/unknown action across its tabs; manager-counter and operator-workflow coordination are tested, including absent-grant races. Other devices/apps are explicitly outside browser-lock guarantees.
- [ ]  Unknown delivery blocks replacement actions; ordinary Gasless retries reuse the appropriate payload/key and top-up recovery follows the currently deployed contract.
- [ ]  The UI distinguishes unavailable configuration, insufficient funds, insufficient Credits, KYC restrictions and sponsor outage without silent payment fallback.
- [ ]  Poll/socket/reload recovery preserves operation identity and late amendments; null accounting never becomes a refund or credited-quantity claim.
- [ ]  The KYC task's entry point/status is integrated without duplicating its journey; receiving and capability restrictions remain visible before funding.
- [ ]  Public rollout has KYC readiness evidence, relay reliability evidence for Gasless and funded direct execution/recovery evidence for MVRK. Frontend mocks alone do not certify server idempotency, registrar execution or either route's real chain effects.

## 13. What remains outside this frontend integration

- RWA/Gas Station idempotency, enqueue/fee atomicity, timeout semantics, reconciliation workers, migrations and server fixes: owned by the relay reliability task.
- The complete Dynamic KYC journey, including onboarding screens, provider sessions, case APIs, webhooks, registrar writes and renewal/revocation policy: owned by the KYC task. This plan only connects its entry-point/status seam to wallet and trading state.
- Account merging or automatic transfer of WE assets/KYC/Credits; custom private-key custody or signing by the backend on the user's behalf. Dynamic direct MVRK execution is included in this frontend plan.
- Automatic support for every contract entrypoint merely because raw signing is available. Wire/test each existing direct action and each Gasless permit path; a new arbitrary-transfer relay remains separate work. Incoming Ethereum funding uses its own source-chain signer.
- Replacing Gas Station with Dynamic sponsorship, using Dynamic JWTs as RWA authorization, importing demo example account-linking/RSA protocols, or implementing the CRED-5 settlement ledger. Continue displaying unknown accounting accurately.

## 14. Frontend code map and external readiness gates

| Frontend area | Verified reference / intended integration point |
| --- | --- |
| Wallet abstraction | wallet.provider.tsx, WalletCore.client.ts |
| Auth and session state | auth.provider.tsx, auth helper, UserProvider |
| Connection and composition | ConnectWallet, root, Vite config |
| Trading integration | orderbook.contract.ts, primaryPurchase.contract.ts, useContractAction, useOpenOrderAction |
| Funding and direct-action guards | ReceiveView, useUsdtBridge, WithdrawFundsModal |
| Consumer API handoffs | Gasless trading, profile, launchpad purchase |

Before implementation/launch, confirm the production SDK after the 4.84.0 spike, Dynamic environment/origin/recovery configuration, deployed chain/contracts/ABI and current API schemas. The reliability task supplies Gasless delivery/recovery guarantees; the KYC task supplies its entry-point/status contract and launch readiness. Direct RPC delivery/recovery remains frontend work in this plan. Missing dependency evidence is an explicit execution/rollout gate, not permission to infer approval, retry blindly or invent new endpoints. Frontend work independent of those decisions may proceed against documented mocks.

## 15. Adjustments after reviewing the demo example

Source: eqtz-demo example-backend/playground, checkout `bbd67288`. The current source code, lockfile, and demo example backend handlers were examined. This checkout does not establish whether earlier deployments worked historically. demo example/RWA source files were not changed as part of this adjustment.

### 15.1. What the frontend team can reuse

| Reference | Useful part | How to apply it in Equiteez |
| --- | --- | --- |
| dynamic.ts | Headless singleton, browser transport, SOL signing call | Isolate it in a client-only adapter; pass the selected wallet explicitly |
| mavryk.ts | pk32 length validation, BLAKE2b-160, `mv1` encoding | Reuse after comparison with a Mavryk utility/backend vector; add `edpk`/`edsig` normalization |
| WalletLink.tsx | Reactive SDK readiness, OTP, busy/error states, explicit creation | Keep the stages; replace demo example linking with RWA challenge/verify |
| ContractDeployFlow | Visible prepare/sign/submit stages and a sequential executor | Reuse the UI principle; Gasless proceeds to subsequent steps only after its own confirmed receipts |
| vite.config.ts | Stable origin, browser polyfills, controlled dev proxy | Check the current Equiteez configuration; do not copy the ngrok hostname/HMR/demo example proxy |
| check-bundle.mjs | Check that the dev inspector is absent from the production bundle | Apply when adding signing diagnostics; separately check that body logging is excluded |

Baseline API from the current demo example code:

```
createClient(...).extend(WebExtension()).extend(SolanaExtension())
useReactiveClient(client) → sdk.loaded / sdk.error / auth / wallets
client.auth.email.sendOTP(email)
client.auth.email.verifyOTP(code)
client.wallets.embedded.createWallet({chain: 'Sol'})
client.wallets.userWallets → chain === 'SOL'
client.wallets.signMessage({wallet: selectedWallet, message: digestHex})
  → signedMessage (base58 signature under this adapter's contract)
```

The casing `'Sol'` in the create API and `'SOL'` in the discovered wallets is specific to this SDK; these are not two different blockchains. Check the exact types in the selected version. `sdk.loaded` does not mean "the wallet list has finished restoring" or "the key is already unlocked." Distinguish these states before allowing another create attempt or a signature.

The SDK transport can be extracted into `signDigest32(selectedWallet, digestBytes)`: it checks the digest length and that the identity has not changed, calls the SDK, decodes the signature, and verifies it against the **original expected digest bytes**. `buildRwaAuthPayload` and `buildPermitPayload` remain separate builders on top of this transport. This is an internal project interface, not the name of a Dynamic API.

### 15.2. Confirmed challenge-framing mismatch

| Scenario | BLAKE2b-256 input | For the message `AB` |
| --- | --- | --- |
| demo example `signMavrykMessage` | `05 |  |
| Current demo example register backend | `PACK(string(message))` | `0501000000024142` |
| RWA login | `PACK(string(hex(UTF8(challenge))))` | `05010000000434313432` |
| RWA gasless | Complete `PACK(permit)` | Its own typed permit schema, §7 |
| Direct MVRK manager operation (also used by demo example) | `03 |  |

This is not an assumption about the Dynamic SDK. The playground helper builds the first variant; WalletStep passes its result to register. The executable demo example verifier and its regression test require the second. Therefore, the existing helper does not match the current backend and cannot serve as the RWA login helper without replacing its framing. The README and the demo example verifier's old header comment are not the current wire contract.

`verifyMavrykSignature` also verifies the first variant. No calls to it were found in the current TSX flows. Even calling it and obtaining true would prove consistency with that same local format, not acceptance of the signature by the backend. In production, local verification is mandatory on the path before POST and must have independent expected vectors.

An offline Ed25519 check was performed for the public test string `Equiteez Dynamic compatibility audit`: each of the three signatures is valid only for its own digest, and the two cross-checks for each return false. This confirms the framing incompatibility, **not execution of a real Dynamic SDK call**.

A JSON file with three synthetic vectors was prepared for the team: payload/digest hex, public key, `mv1`/`edpk`, signature hex/base58/`edsig`, and the expected verification matrix. The file contains no private key, real user data, or active server challenges. The fixtures are suitable for bytes/encoding regression tests, but do not replace the real Dynamic auth/permit fixtures from P0. Additionally, all three signatures were verified against their original payloads using the installed `webmavryk-utils.verifySignature` from Gas Station: this checks cryptography/encoding, not GS request acceptance, permit schema validation, or chain simulation.

### 15.3. demo example account linking is not carried over to RWA

demo example flow: existing email/password user → HttpOnly demo example cookies → `POST /users/me/signing-keys/challenge` → signature → `POST /users/me/signing-keys`. It accepts a raw hex key/signature, derives `mv1`, and rotates that user's single active signing key. The Dynamic JWT does not serve as a bearer token in this flow.

The RWA flow remains wallet-first: `mv1` → `/auth/challenge` → signature in its own format → `/auth/verify` → RWA JWT. There is no additional email/password demo example login, `registerSigningKey`, or key rotation of an existing WE profile. Comparing emails in the demo example UI does not replace wallet key/address/JWT verification and does not merge RWA accounts.

Another discrepancy in the current checkout: the demo example challenge/register routes require fresh TOTP, while the playground login explicitly does not implement 2FA. Also, the demo example challenge lifecycle is `GET → verify → key rotation → DELETE`, whereas RWA atomically consumes the nonce before verification; the retry rules differ. Therefore, this playground cannot be declared a verified current demo example linking E2E merely because the UI exists.

### 15.4. Reuse manager-operation signing for MVRK; exclude demo example RSA transport

signMavrykOperation demonstrates the `03` watermark needed for direct MVRK operations. Reuse that signing domain through the identity-bound toolkit Signer in §3.6, using the selected wallet and local verification. The helper itself does not provide an Equiteez transaction executor, native-budget checks or timeout recovery. The demo example transport RSA-encrypts the signature for its own prepare/submit endpoint; that transport is not reused.

RWA Gasless has no `/signing/public-key`, `encryptedSignature`, RSA wrapping, or signing of an demo example `unsignedPayload`. Gasless passes a canonical `edsig` inside the Micheline permit or top-up JSON, over HTTPS with an RWA JWT. Direct MVRK uses the toolkit signature result and injects signed bytes into RPC without RWA relay or demo example prepare/submit. Do not add an RSA client transport by analogy with demo example. Even submitting a manager operation through the backend does not, by itself, turn it into a sponsored permit flow.

### 15.5. Lifecycle safeguards missing from the demo

- `getMavrykWallet()` takes the first SOL wallet, and the signing helper then looks it up again. In production, take a snapshot of wallet ID/key/address/epoch, pass the specific wallet to the signer, and check the snapshot after every await.
- Playground ready is `!!session && !!signerAddress`. ConnectPanel hides WalletStep as soon as `mv1` exists. Therefore, the presence of a session and an address does not prove that key registration has completed. Equiteez readiness requires signing readiness and an RWA JWT for the exact selected address.
- The email mismatch check inside WalletStep is useful for an explicit account switch, but does not compensate for the parent ready predicate bypassing that component.
- The `Verify & create wallet` button in the current manual flow only calls OTP verify. Product copy must match the actual action; creation has its own state and protection against repeats.
- Full logout may fail to clear local state if Dynamic logout throws an error. Cleanup in the new adapter is unconditional; remote revocation failures are handled separately.
- A busy UI does not replace atomic single-flight, cross-tab coordination, recovery after a create timeout, OTP cooldown, wallet restoration, or stale-result guards.

### 15.6. Browser/build handoff

The demo example SPA uses `createRoot` + BrowserRouter and creates Dynamic during module import. Equiteez includes Remix SSR. The Equiteez Vite config already has a polyfill plugin: first check whether `Buffer/global/process` support and the client build are sufficient, rather than adding a second instance of the plugin. Verify that SDK initialization is absent from the server graph and that there is a single client/iframe after StrictMode/error recovery.

The demo example README states that the polyfill plugin does not support Vite 8, but the lock metadata for `vite-plugin-node-polyfills@0.28.0` already includes `^8` in its peer range. Neither the comment nor the peer range alone proves runtime compatibility. Do not turn this comment into a requirement to upgrade/downgrade Equiteez; the build with its agreed lockfile is the deciding factor.

Exact origin configuration matters more than "CORS is enabled in general": protocol/hostname/port must match the dev/staging/prod deployment. OTP can succeed while the WaaS iframe is unavailable. Configure the Console allowlist and the SDK's required `frame-src/connect-src` in the app, and display a blocked-iframe error separately.

dev-tools/csp-bypass strips CSP and frame headers. Do not carry it over to the product, make it part of frontend setup, or use it as a criterion for successful E2E. Acceptance testing is performed in a normal browser profile without this override.

The demo example same-origin `/api` proxy serves cookie auth. Equiteez can use its existing routing infrastructure while retaining the RWA bearer contract. Do not carry over `credentials:'include'`, the backend target, or ngrok/HMR parameters as a mandatory approach to Dynamic integration.

### 15.7. Debug tooling and KYC boundaries

The idea of a compile-time dev inspector + post-build assertion can be reused, but not the entire request logger. It redacts only a few top-level password fields, while the API stores request/response bodies. Removing the inspector UI does not prove that logging is absent: `recordRequest` is called directly from the API layer. The new diagnostic logger stores only allowlisted metadata/error codes; JWTs, OTPs, signatures, and active permits are excluded from storage and session replay, including in shared dev environments.

The existence of MembershipKycScenario does not resolve Dynamic user onboarding. It demonstrates a deployment registry and lambda installation with demo example permissions; it is not investor verification or production registrar enrollment of a new `mv1`. Use the separately delivered KYC entry point from section 6; this demo example scenario is not that implementation.

### 15.8. Practical migration sequence

1. Reproduce the SDK baseline from the lockfile, with the correct origin and iframe working without CSP bypass.
2. Extract only the selected-wallet digest-signing transport and public address/encoding helpers.
3. Connect separate RWA auth/permit builders; check synthetic vectors first, then real Dynamic vectors.
4. Bring the WalletStep stages into Equiteez with RWA auth, deterministic identity, and unconditional logout cleanup.
5. Connect both executors: Gasless through RWA and direct MVRK through the Dynamic toolkit. Enable `canSendMavrykOperation` and individual action capabilities after direct integration checks; run zero-MVRK Gasless and funded direct E2E, including cross-mode recovery, and record receipts.
6. Make the decision about the new SDK generation separately using the same tests. Do not include demo example-specific auth, RSA, deployment scenarios, or debug bypass in the product.