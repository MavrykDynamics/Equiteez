# Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/guides/vite) for details on supported features.

## Typegen

Generate types for your Cloudflare bindings in `wrangler.toml`:

```sh
npm run typegen
```

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

## Development

Run the Vite dev server:

```sh
npm run dev
```

To run Wrangler:

```sh
npm run build
npm run start
```

## Ethereum wallet connection

`EthereumProvider` exposes Ethereum wallet state and actions through
`useEthereumContext()`. Render `REthereumWalletDropdown` beside the source
amount; `connect()` opens that selector through provider state.
`signOut()`, `switchNetwork()`, and `refreshBalance()` manage the connection.
Ethereum state is independent of the Mavryk `UserProvider` and authentication.

The dependency declarations include `wagmi@2.19.5` and `viem@2.52.2` from the
reference bridge. Run `npm install` to install them and update `package-lock.json`.
The scoped `@walletconnect/logger` override follows Wagmi's connector guidance
for its transitive `pino` dependency.

- Network: Ethereum Sepolia (chain ID `11155111`).
- Deposit asset: the bridge's Mock USDT test token at
  `0x0111C65C13b3Ee07662340692CBA957B29572F27`. Metadata comes from the contract;
  balances refresh every 15 seconds while the app is visible. `Max` uses the
  token balance rounded down to six decimals, the precision available on Mavryk.
- Wallets: installed Ethereum wallets and WalletConnect QR/mobile connections.
  Approved sessions reconnect on page reload. A wrong network requires a
  switch to Sepolia before continuing.
- Optional build-time configuration: `ETHEREUM_RPC_URL` overrides the public
  Sepolia RPC; `WALLETCONNECT_PROJECT_ID` overrides the temporarily shared bridge
  project ID. The WalletConnect project must allow the deployed Equiteez origin.

## USDT bridge deposits

`app/consts/usdtBridge.ts` contains the single Sepolia → Basenet pair ported from
`mavryk-bridge` (`ETH_ERC20_1` → `MAV_WRAPPED_ERC20`). The reference repo's static
ERC1 labels are stale: live Ethereum metadata reports **Mock USDT / USDT**, with
18 decimals. The destination reports **Tether USDT / wUSDT**, with 6 decimals.

- Ethereum wrap bridge: `0x476a30d098eD197c2b109abaBbf5135D49df0967`.
- Mavryk destination: `KT1J8yjtFGY6fiqjSNLpUjDnX2bj2HsUizAi`, FA2 token ID `0`.
- Mavryk minter mapping: `KT1QgGZLNv8tB512woJLDfL32gE8J6PcjWzP`, wrapped-token
  ledger `3523`. This maps the source ERC20 to the destination above; it is not
  called by the frontend. No other bridge contracts or token pairs are imported.

`Deposit Funds` requires both connected wallets. The source wallet must use
Sepolia; the receiving Beacon account must use Basenet. The provider checks the
accounts and network before each signature. `usdtBridge.contract.ts` checks the
live balance, decimals and allowance, confirms exact ERC20 approval when needed
(resetting insufficient nonzero allowance first), then confirms
`wrapToken(address,uint256,bytes)` on the Ethereum wrap bridge. The token address
is lowercased; the recipient is encoded as UTF-8 address text bytes. No Mavryk
signature or claim is required for this direction.

Amounts stay in BigNumber/bigint, with at most six entered decimal places so the
same amount is representable on both chains. The second field is a read-only
1:1 estimate, matching the reference flow and its currently configured zero
wrapping fee. Ethereum gas is shown by the wallet. This estimate is not a live
fee quote.

The destination balance uses the bridge's wUSDT token, **not** Equiteez's distinct
USDt contract `KT1VAymHKvx9oreDRqN22rf2huuYiV5ofe34`. `TokensProvider` preserves
API metadata and adds a fallback for the bridge token so existing balance
normalization can recognize it. Trading/withdrawal stablecoin settings are unchanged.

Bridge status survives closing the modal within the current app session. A
receipt timeout retains the hash and offers **Check Confirmation**, without
resubmitting the lock. Reverted or cancelled transactions are errors. Ethereum
confirmation is shown as **request submitted / waiting for arrival**; there is
no transaction-correlated validator or Mavryk mint-status API in the reference
repo, so the UI does not claim destination settlement. Reloading the page clears
the in-memory status; use the Ethereum transaction link to inspect a sent request.

Validate the contract flow with:

```sh
npm run test:run -- app/contracts/usdtBridge.contract.test.ts
```

## Deployment

> [!WARNING]  
> Cloudflare does _not_ use `wrangler.toml` to configure deployment bindings.
> You **MUST** [configure deployment bindings manually in the Cloudflare dashboard][bindings].

First, build your app for production:

```sh
npm run build
```

Then, deploy your app to Cloudflare Pages:

```sh
npm run deploy
```

[bindings]: https://developers.cloudflare.com/pages/functions/bindings/
