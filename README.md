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
`useEthereumContext()`. Call `connect()` to open the wallet selector;
`signOut()`, `switchNetwork()`, and `refreshBalance()` manage the connection.
Ethereum state is independent of the Mavryk `UserProvider` and authentication.

The dependency declarations include `wagmi@2.19.5` and `viem@2.52.2` from the
reference bridge. Run `npm install` to install them and update `package-lock.json`.
The scoped `@walletconnect/logger` override follows Wagmi's connector guidance
for its transitive `pino` dependency.

- Network: Ethereum Sepolia (chain ID `11155111`).
- Deposit asset: the bridge's ERC1 test token at
  `0x0111C65C13b3Ee07662340692CBA957B29572F27`. Metadata comes from the contract;
  balances refresh every 15 seconds while the app is visible. `Max` uses the
  full token balance without rounding through a JavaScript number.
- Wallets: installed Ethereum wallets and WalletConnect QR/mobile connections.
  Approved sessions reconnect on page reload. A wrong network requires a
  switch to Sepolia before continuing.
- Optional build-time configuration: `ETHEREUM_RPC_URL` overrides the public
  Sepolia RPC; `WALLETCONNECT_PROJECT_ID` overrides the temporarily shared bridge
  project ID. The WalletConnect project must allow the deployed Equiteez origin.

The first deposit field uses Ethereum data. The Mavryk receive field retains its
existing data, and the bridge summary/status remain placeholders. `Deposit Funds`
only opens `BridgeStatusView`; it does not request approvals or submit a bridge
transaction. ERC1 has no configured fiat price, so its fiat estimate is unavailable.

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
