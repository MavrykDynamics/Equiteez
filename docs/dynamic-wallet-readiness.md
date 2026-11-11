# Dynamic email wallet: readiness report

Branch `MAV-4111-dynamic-wallet`, November 11, 2026. Covers DYN-FE-01…04, 09, 10, 13, 14 and 15 for the MVRK-paid (direct) route. Gasless (DYN-FE-05/07/08/11) and Dynamic KYC (DYN-FE-12) are out of this release.

Everything below is proven by unit and component tests and a local browser check of the UI. Nothing has yet been signed by a real Dynamic wallet or executed on Basenet: that is the live checklist at the end.

## 1. What a user gets

- **Sign in with email**: the Connect Wallet modal offers Mavryk Wallet (extension) or "Continue with email" (email → code → wallet → RWA sign-in). A live Dynamic session signs in without a code.
- **One active wallet**: the Portfolio switcher (Wallet: Mavryk Wallet | Email) signs out of one and into the other. They are separate accounts: assets, orders and KYC do not move between them.
- **MVRK-paid actions**: buy, sell, cancel, refund, primary purchase and withdraw run through the selected wallet's toolkit; email wallets sign with Dynamic, gas is paid in MVRK.

## 2. Configuration

| Variable | Meaning | Local `.env` | Preview (`wrangler.toml`) | Production |
| --- | --- | --- | --- | --- |
| `DYNAMIC_ENVIRONMENT_ID` | Public id of the Dynamic environment | Sandbox id | Sandbox id | not set |
| `DYNAMIC_WALLET_ENABLED` | Offer email sign-in (`true`) | `true` | `true` | not set (off) |
| `DYNAMIC_WALLET_AUTO_CREATE` | The environment creates the wallet on sign-up; the app then never creates one | `true` | `true` | not set |
| `DYNAMIC_DIRECT_ENABLED` | Email-wallet actions allowed before they are marked tested: `true` for all, or a list such as `orderbook.buy,orderbook.sell,withdraw` | `true` | `true` | not set (all gated) |

Without `DYNAMIC_WALLET_ENABLED` and an environment id the app behaves exactly as before: no email option, Connect Wallet opens Mavryk Wallet.

The client reads these at build time (`define: { "process.env": process.env }` in `vite.config.ts`). The Vite dev server restarts on `.env` changes.

**Verify on the first preview deploy**: the preview values sit in `wrangler.toml` next to the existing variables (`RWA_API` etc.), but whether Cloudflare Pages passes `[env.*.vars]` into the build, not only to runtime functions, depends on how the project builds. If email sign-in does not appear on `dev.equiteez-app.pages.dev`, add the same variables as Build environment variables in the Cloudflare Pages dashboard.

### Dynamic dashboard (app.dynamic.xyz, project `equiteez-app`, Sandbox)

- Solana enabled (Devnet), Solana embedded wallets enabled. The Solana network does not matter: only the ed25519 key is used, to derive the Mavryk `mv1`; the Mavryk network comes from the app's RPC node (Basenet).
- Auto-create wallet on signup: **on**, matched by `DYNAMIC_WALLET_AUTO_CREATE=true`: the app waits up to 30 s for the wallet Dynamic creates and never creates one itself. If the setting is turned off, set the variable to `false` so the app creates the wallet; the two must agree, or a second wallet with another `mv1` could be created. A user created while auto-create was off and left without a wallet cannot sign in under `true`.
- Email OTP login enabled.
- CORS origins: `http://localhost:5173`, `https://*.equiteez-app.pages.dev`. Production (`https://app.equiteez.com`) is **not** listed: production needs its own (Live) environment and origin before enabling.

## 3. Versions

| Package | Version | Why |
| --- | --- | --- |
| `@dynamic-labs/client`, `web-extension`, `solana-extension`, `react-hooks` | 4.84.0 (exact) | Baseline proven by the demo; no SDK-generation mix |
| `@solana/web3.js` | 1.98.1 (exact) | Exact peer of the Solana extension |
| `@mavrykdynamics/taquito`, `taquito-utils`, `taquito-local-forging` | 20.1.0 | Existing toolkit family; utils and forger declared explicitly |
| `@noble/curves`, `@noble/hashes` | 2.2.0 | ed25519 verification of a 32-byte digest, BLAKE2b |
| `bs58` | 6.0.0 | Plain base58 of the Solana-style key |
| `@mavrykdynamics/taquito-signer` (dev) | 20.1.0 | Independent test vectors only |

The Dynamic SDK is loaded only in the browser, in its own chunk, when email sign-in is used or restored; it is not in the server bundle. SDK logging is set to WARN (development) / ERROR (production).

## 4. Capability matrix

`app/providers/WalletProvider/capabilities.ts`, enforced in controls and in action handlers.

| Action | Mavryk Wallet | Email wallet |
| --- | --- | --- |
| buy, sell, cancel, refund | tested | gated (`DYNAMIC_DIRECT_ENABLED`) |
| primary purchase | tested | gated |
| withdraw (tokens; MVRK if listed) | tested | gated |
| bridge deposit (Ethereum → Mavryk) | tested | gated |
| bridge withdraw (Mavryk → Ethereum) | unavailable | unavailable |
| DODO | unavailable | unavailable |
| any action not in the registry, Gasless mode, another network | refused | refused |

Move an action from `gated` to `tested` only after its live check below passes.

## 5. Safety properties (tested)

- **Keys and signatures**: `mv1`/`edpk` derived from the Dynamic key match taquito's `InMemorySigner` byte for byte; every Dynamic signature is verified locally before use.
- **RWA sign-in**: the double-encoded challenge is signed, verified locally and sent as `edpk`/`edsig` with `walletProvider: "dynamic"`; a wallet change during signing sends nothing.
- **Operations**: the Dynamic signer signs only manager operations (watermark `03`) from this wallet, and only the operation the app registered as reviewed: same contracts, entrypoints, parameters and amounts, at most a leading reveal.
- **Fees**: the trade panel shows fees + burn (reveal included); email wallets cannot trade without a known fee their MVRK balance covers; a fee more than 20% (at least 0.01 MVRK) above the shown one stops the action.
- **Delivery**: the operation hash is stored before broadcast; a lost response stays "unknown" and is resolved only by receipt; the same action cannot be sent twice while unresolved (tabs included); success requires every result, internal ones included, to be applied.
- **Operator grants**: an existing grant is used and never removed; a temporary one is added and removed only when none exists.
- **Sessions**: a failed or superseded connect never breaks the active wallet; sign-out clears local state even if a remote logout fails; an expired RWA session keeps the Dynamic session so signing in needs no new code.
- **Logs**: no OTPs, JWTs, signatures, signed bytes or keys are logged; stored error texts mask long hex and are capped at 300 characters.

## 6. Known gaps

- **KYC**: a new email wallet has no KYC, so trading stays blocked until the Dynamic KYC flow (DYN-BE-02/03, DYN-FE-12) exists.
- **Approved fee for withdraw and primary purchase**: the withdraw summary shows a fixed fee constant and primary purchase estimates only after the click, so neither has a fee budget to compare against (balance is still checked).
- **MVRK withdrawal**: supported in code, but the withdraw asset list comes from the RWA portfolio; whether MVRK appears there is unverified.
- **Mobile Portfolio** has no wallet switcher; switching on mobile goes through Change account in the header.
- **Development only**: the first email sign-in triggers a one-time Vite dependency reload.

## 7. Open dependencies

| Owner | Needed | Status |
| --- | --- | --- |
| Backend (DYN-BE-01) | `/auth/verify` accepts `walletProvider: "dynamic"` with `edpk`/`edsig` for a never-revealed `mv1` | not confirmed yet |
| Backend / product | Live Dynamic environment and production origin | not started |
| Backend (DYN-BE-02/03) | Dynamic KYC onboarding and eligibility | not started |

## 8. Live checklist (Basenet, normal browser, no CSP bypass)

Record public evidence only: SDK version, operation hashes, receipts. Never OTPs, JWTs or signatures.

1. New email → code → wallet created once (no second wallet after reload or double click) → `mv1` shown → RWA sign-in succeeds.
2. Reload: session and the same `mv1` restored. Switch to Mavryk Wallet and back: same `mv1`, no new code (the Dynamic session is kept). Sign out, then sign in with the same email: a code is needed (Sign out ends the Dynamic session), same `mv1`.
3. Another device or browser: same email gives the same `mv1`.
4. Fund the `mv1` with MVRK (faucet) and USDT (bridge or transfer); the bridge deposit lands on the email wallet.
5. First trade (includes the reveal): fee shown, order placed, receipt applied. Second trade: no reveal.
6. Cancel and refund an order; withdraw a token; withdraw MVRK with Max (if listed).
7. Not enough MVRK: blocked with the needed amount; reject or close signing: nothing sent.
8. Reload during a pending trade: no duplicate; the result resolves from the receipt.
9. Switch Mavryk Wallet ↔ Email in Portfolio: separate accounts, no data mixed.
10. Full Mavryk Wallet regression: sign-in, trade, cancel, refund, withdraw, bridge.

## 9. Commits

| Commit | Ticket | Change |
| --- | --- | --- |
| `08f0c0c8` | FE-01 | Dynamic SDK and crypto dependencies |
| `b2a130a6` | FE-01 | Mavryk key, address and signature helpers |
| `e3521065` | FE-01/03 | Dynamic client: loading, OTP, wallet selection, digest signing |
| `f2f592ed` | FE-09 | Dynamic Mavryk signer and toolkit |
| `c4e8352f` | FE-10 | Attempt store, guarded injector, reconciliation |
| `e231fd44` | FE-09 | Receipt checks, operator grants, tracked actions |
| `9653ec63` | FE-02 | Provider-neutral wallet identity |
| `471478fc` | FE-04 | RWA sign-in with the selected wallet |
| `681d5fbb` | FE-03 | Sign-in modal and Portfolio wallet switcher |
| `009c3823` | FE-14 | Capability registry and guards |
| `b3e4d54b` | FE-09 | Full MVRK fee, fee-increase stop, reviewed-operation signing |
| `e37f53bc` | FE-13 | Withdrawals through the shared send, MVRK Max reserve |
