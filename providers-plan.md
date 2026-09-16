# Remove MarketsProvider and DexProvider

## Scope and decisions

Investigation baseline: commit `020d55ff`, 2026-09-16. The requested “MarketProvider” is named **MarketsProvider** in this repository; the Dex folder is spelled **Dexprovider**. This document is the implementation handoff. No application code was changed during investigation.

Remove both contexts and their obsolete API/state models. Reuse AssetsProvider, TokensProvider, ApolloProvider, and the existing RWA orderbook-depth hook. Do not replace these contexts with another global market/trading provider or reconstruct the mock-derived EstateType model.

The user explicitly approved: use verified current API fields first; allow a cached, per-orderbook contract read for missing configuration; disable trading when required configuration cannot be resolved. Do not silently invent token IDs, currency keys, decimals, or tick sizes.

Preserve the live secondary-market trading flow, transaction feedback, and recommendation popup. Delete unreachable legacy UI and branches. No redesign, unrelated provider rewrite, or wholesale metadata API migration is required.

Evidence below is from repository code and checked-in generated GraphQL types. `.env` contains GRAPHQL_API, RWA_API, MBRWA_API, API_URL, TOKENS_METADATA_API, and RWA_SERVICES_API; no secret values are reproduced here. Live response payloads and contract view shapes were not probed. Validate the proposed selected-orderbook query against the configured schema during implementation; checked-in types establish the field candidates, not deployment freshness.

## 1. MarketsProvider: responsibilities and dependents

Source: `app/providers/MarketsProvider/markets.provider.tsx`.

- Runs React Query `["fetchAssets", "all"]` through `app/lib/apis/mbrwa/assets.ts` (`MBRWA_API/assets`). The generic legacy fetcher supports filters; this provider passes none.
- `utils/createMarketAssetsCollection.ts` transforms the old asset/orderbook response into EstateType records, a Map of orderbook configuration, sorted asset slugs, and base/quote token metadata. `utils/transformAssetData.ts` expands the old payload into the large legacy estate shape.
- Merges `app/mocks/assets.mock.json` and `app/mocks/rwas.json` with API markets; API values overwrite matching mock slugs. Mock slug normalization assumes token ID zero. `marketsArr` uses `withSortedFromMap` and API ordering.
- Exposes `config.orderbook`, `markets`, `marketsArr`, `sortedMarketAddresses`, `marketAddresses`, `orderbookAddresses`, `pickMarketByIdentifier`, `validBaseTokens`, `pickers`, loading, and ApiError.
- Stores `activeMarketSlug`; derives `activeMarket`; `updateActiveMarketState` sets the slug and marks active-market loading false. This is duplicated route selection state.
- Creates fallback metadata and obtains `upsertTokensData`, but both metadata-upsert effects are commented out. It **does not currently populate TokensProvider**.
- `utils/marketPickers.ts` creates address-keyed configuration/contract/token lookup records, two empty DODO records, and a false-defaulting valid-token Proxy. Those abstractions mostly outlive their consumers.

Every direct context consumer:

| File | Fields used | Disposition |
| --- | --- | --- |
| `app/providers/Dexprovider/dex.provider.tsx` | `config` | Remove with DexProvider. |
| `app/providers/AppGlobalLoader.tsx` | `isLoading` | Remove this loading gate. |
| `app/routes/trade.$address/components/BuySellPanel/BuySellPanel.tsx` | `isLoading`, `marketsArr`, `updateActiveMarketState` | Already receives AssetType from the route; stop searching legacy estates and setting global selection. |
| `app/lib/organisms/PriceSection/popups/index.tsx` | `marketsArr`, `sortedMarketAddresses`, `pickers.pickOrderbookConfig`, `activeMarket` | Live BuySellContent: use passed asset, selected-orderbook config, AssetsProvider recommendations, and current asset symbol. |
| `app/lib/organisms/PriceSection/PrimaryPriceBlock.tsx` | `activeMarket`, `isActiveMarketLoading` | Unmounted legacy block. Remove after eliminating the live file's ProgresBar import (see below). |
| `app/lib/organisms/PriceSection/SecondaryPriceBlock/SecondaryPriceBlock.tsx` | `validBaseTokens` | Unmounted legacy block; delete, rather than recreate mock-validity state. |

`app/root.tsx` imports/mounts MarketsProvider. No other direct context consumer was found.

Additional dependencies on this provider folder (must resolve before deleting the folder):

- `app/contracts/templates/operationPopupData.tsx`: EstateType and SECONDARY_MARKET; live through PopupProvider and trading recommendations.
- `app/lib/organisms/PriceSection/PriceSection.tsx`: estate types; no external mounting consumer found. It is the only mounting caller of PrimaryPriceBlock/SecondaryPriceBlock.
- `PriceSection/screens/BuySellScreen.tsx`, `screens/BuySellLimitScreen.tsx`, and `hooks/useOrderbookTokenMetadata.ts`: SecondaryEstate; live through BuySellContent.
- `PriceSection/screens/OTCBuySellScreen.tsx`: SecondaryEstate; its only observed import is commented out.
- `app/templates/AssetTemplates/AssetTemplates.tsx`: EstateType; exports are re-exported by its index, but no outside consumer of that folder was found. Delete this orphaned legacy subtree after a final reference check.
- `app/lib/sitemap/sitemap.server.ts`: imports `estateSlugs.ts`. This is a live server dependency, independent of market state. Relocate that helper to `app/lib/sitemap/estateSlugs.ts`, keeping sitemap behavior and its mock input unchanged in this refactor.
- Internal utilities, schemas, and Dex storage/config tests import the legacy types. Remove obsolete ones and move surviving tests to the replacement utility location.

Unused context surface after removing the listed consumers: market address arrays, standalone market map/lookups, marketApiError, all pickers except pickOrderbookConfig, both empty DODO pickers, and active-market state. Delete; do not port public context fields merely because they were exported.

## 2. DexProvider: responsibilities and dependents

Source: `app/providers/Dexprovider/dex.provider.tsx`.

- Derives base-slug → quote-slug pairs from MarketsProvider's orderbook config.
- Fetches `MBRWA_API/orderbooks` through `useApiQuery`, initially and every 30 seconds while visible, with forced refresh integration. Reports fetch errors through ToasterProvider.
- Resolves positive raw tick size from `tickSize`, then `tick_size`, then a read-only Basenet contract `getConfig()` view. Only unresolved API entries trigger the fallback. The current fallback loads all selected entries with Promise.all, so one failure rejects the batch.
- Builds `orderbookStorages`, keyed by base token slug: bid/ask atom prices, tick size, fees, minimum quantities/values, expiry minimum, currency key, base/quote token identity/decimals, and orderbook address. Items without a valid tick size are omitted.
- Wraps those entries in a Proxy that returns a zero/empty object for a missing key. Loading combines API availability and unresolved fallback tick sizes, ending on error.

Every direct context consumer:

| File | Fields used | Disposition |
| --- | --- | --- |
| `app/providers/AppGlobalLoader.tsx` | `isLoading` | Remove the global trading-data gate. |
| `app/lib/organisms/PriceSection/popups/index.tsx` | `isLoading`, `orderbookStorages[slug].tickSize` | Replace with selected-orderbook readiness/config. The other storage fields are not consumed here. |
| `app/lib/organisms/PriceSection/hooks/useOrderbookTokenMetadata.ts` | `orderbookTokenPair` | Derive token identity from selected config/asset.orderbook; reuse TokensProvider metadata. |

`app/root.tsx` imports/mounts DexProvider. There are no other direct context consumers.

Live utility imports are separate from the context and must not be deleted indiscriminately:

- `PriceSection/popups/index.tsx`: depth best-price helpers, market quantity/value calculations, tick alignment, display price resolution.
- `PriceSection/screens/BuySellScreen.tsx`: safeDivByPrice.
- `PriceSection/screens/BuySellLimitScreen.tsx`: price/quantity/balance helpers.
- `PriceSection/orderBook.consts.ts`: isMarketOrderPrice for legacy raw-open-order processing; the live table now calls its depth-based functions.
- `PriceSection/SecondaryPriceBlock/SecondaryPriceBlock.tsx`: getCurrentPriceFromOrderbookDepth, removable with that unmounted component.
- Tests: `utils/orderbookPrice.test.ts`, `utils/orderbookConfig.test.ts`, `utils/storage.test.ts`.

## 3. Replacement ownership

| Responsibility | Existing source/replacement | Necessary change |
| --- | --- | --- |
| Asset catalog, profile, APY, market type, orderbook address/quote token/fees | AssetsProvider → `RWA_API/assets` | Reuse `assets` and incoming AssetType. No second assets fetch or legacy transform. |
| Catalog price/series/primary issuance summaries | AssetsProvider `prices` | Reuse for cards/recommendations. Its fetchPrices actually uses **RWA_SERVICES_API**, not RWA_API; leave this working integration in place. |
| Selected asset | `trade.$address/route.tsx` already resolves `assets.find(address)` | Pass the asset through BuySellPanel. No active-market context. |
| Token metadata | TokensProvider → `useAssetMetadata`, existing fallback metadata helper | Reuse base/quote slugs; derive local fallbacks from verified AssetType metadata if lookup is missing. No new metadata fetching/state. |
| Token list and metadata bootstrap | Root loader → TokensProvider utils | Keep: list uses API_URL; metadata is GraphQL via **TOKENS_METADATA_API**, not Apollo's GRAPHQL_API. Removing MBRWA does not require replacing either endpoint. |
| Executable orderbook settings | GraphQL `orderbook` and `currencies` relationships | Small selected-orderbook query/hook; no existing provider currently exposes all these settings. |
| Current bid/ask, depth, liquidity | Existing `useOrderbookDepth` → `RWA_API/assets/{address}/orderbook` | Already used in trading; keep 10-second polling, query keys, error handling and depth conversions. Do not replace execution quotes with catalog prices. |
| Recent trades | Existing useOrderbookLastTrades + ApolloProvider/GRAPHQL_API | Already migrated in behavior; move out of the misleading mbrwa folder. Preserve 3-second refresh and event parsing. |
| Balances, KYC, account status, first-order confirmation | UserProvider; WalletProvider; AuthProvider | Keep these dependencies and balance lookup semantics. PortfolioProvider is wallet-scoped summary data, not an orderbook-config replacement. |
| Notifications/transaction lifecycle | ToasterProvider, PopupProvider, useContractAction | Preserve live behavior; change recommendation data props to current assets. |

AssetsProvider currently exposes loading but not query errors. Add explicit asset-fetch error to its context only where needed to distinguish failed catalog loading from genuine absence in the trade route. Avoid a general provider redesign. Its `isLoading` includes background fetching; do not add config/depth refresh to that global loading mechanism.

## 4. Minimal new code and GraphQL mapping

Recommended locations (use existing equivalents if introduced after this baseline):

1. `app/lib/apis/queries/orderbookConfig.query.ts`: a typed query filtered by **selected orderbook contract address**, not a global orderbook fetch.
2. `app/lib/orderbook/orderbookConfig.types.ts` and `orderbookConfig.ts`: a small execution-config type and pure normalization/validation helpers. Keep raw atom values as decimal strings/BigNumber-compatible values, token IDs as strings; avoid lossy JS number conversions.
3. `app/hooks/useOrderbookConfig.ts`: compose the Apollo query, runtime validation, and only-needed contract fallback. Return explicit loading/error/unavailable/ready data. Reuse ApolloProvider's client/error handling and `useQueryWithRefetch` for polling/forced updates; begin with a 30-second interval matching the replaced config refresh. No independent Apollo client or duplicated provider state.
4. `app/contracts/orderbookConfig.ts`: move/adapt the existing read-only getConfig logic here. Use a React Query cache keyed by chain/network + orderbook address for fallback reads; do not preload every asset. Validate actual returned view fields before using them. Cache failures per selected book, expose retry, and never turn a failure into zeros. Prefer existing verified GraphQL fields so the fallback normally remains unused.
5. Move surviving pure price/tick helpers and their tests from Dexprovider/utils to `app/lib/orderbook/orderbookPrice.ts` and `app/lib/orderbook/orderbookTick.ts`. Split RPC reading from pure arithmetic when moving orderbookConfig.ts. No need to keep the old storage mapper/type.

The checked-in `app/utils/__generated__/graphql.ts` contains Orderbook_Bool_Exp, Orderbook_Currency_Bool_Exp, and Token_Bool_Exp confirming these candidate relationships/fields:

| Execution field | Query source | Normalization/guard |
| --- | --- | --- |
| orderbook address | `orderbook.address` | Must match asset.orderbook.address. |
| raw tick size | `orderbook.tick_size` | Positive integer atom value; verified RPC fallback if missing/invalid. |
| order minimums | `min_buy_order_amount`, `min_buy_order_value`, `min_sell_order_amount`, `min_sell_order_value` | Nonnegative atom integers. Known zero differs from missing data. |
| base identity | `rwa_token { address token_id }` | **Do not use orderbook.rwa_token_id**: it is a relational token-row ID, not the on-chain FA2 ID. Match asset address. |
| currency key | `currencies { currency_name token { address token_id } }` | Match RWA asset quote address AND token ID; use currency_name, never assume symbol equals contract key. |
| quote identity/decimals | `asset.orderbook.quote_token` plus matched GraphQL token | Cross-check identity. Existing TokensProvider/asset metadata supplies decimals; no metadata-only query. |
| fees | `buy_order_fee`, `sell_order_fee`; also AssetType.orderbook | Current live trading does not consume Dex fee copies. Only retain normalized fields if actually used. |
| expiry constraint | `min_expiry_time` | Previously stored but never consumed; do not claim existing UI enforces it. Keep enforcement as an explicit separate behavior change if desired. |

Query only needed fields. Use generated operation types/codegen, not manual edits to generated files. Validate deployment schema and at least one real matching base/quote pair before relying on the new query. If GraphQL cannot supply a required setting, the approved contract fallback must resolve it from a verified view/storage shape. Existing getConfig code proves only tickSize reading; it does not prove the other fields' view names. Do not guess or retain MBRWA as fallback.

No new “trade estate” adapter is needed. BuySellContent can receive AssetType plus resolved execution config and metadata; child screens can receive the same narrow identity/metadata props rather than re-running config queries. Update the existing useOrderbookTokenMetadata hook instead of adding a competing metadata abstraction. Use TokensProvider first, local asset metadata fallback second, and make authoritative decimal/identity mismatches explicit. Placeholder metadata may support display but must not authorize orders with guessed decimals.

TokensProvider's existing metadata loader maps by contract and can collapse multiple token IDs per contract. That is a pre-existing risk: preserve full address+ID slugs in the migration and use selected asset/config data to avoid inheriting an incorrect ID. Do not broaden this task into a full metadata-loader rewrite unless required for an actual supported pair.

## 5. MBRWA migration and deletions

The only actual MBRWA network fetchers found are `app/lib/apis/mbrwa/assets.ts` and `orderbooks.ts`, both using `index.ts`. Delete all three after consumers move. Do not just replace the base URL: current RWA `/assets` returns `{ items }`, not the old `{ assets }` estate payload, and there is no verified current equivalent of the legacy global `/orderbooks` route in this code.

Remove `MBRWA_API` from `vite-env.d.ts`, both environment blocks of `wrangler.toml`, and the local `.env`/deployment configuration when implementing. Do not print unrelated env contents or commit local secrets. `wrangler.toml.example` currently has no MBRWA entry. Keep GRAPHQL_API/RWA_API and the separate working metadata/prices/indexer integrations. Check builds with MBRWA entirely unset: the old module initializes `new URL("")` at import time.

Other files under mbrwa are not legacy HTTP fetchers:

- Move `orderbookLastTrades/useOrderbookLastTrades.tsx` and `orderbookLastTrades.schema.ts` to `app/lib/apis/orderbookLastTrades/`; preserve their existing GraphQL query and behavior.
- Move `user/userOrders/order.const.tsx` to `app/lib/orderbook/order.const.ts`; update the recent-trade schema and OrderBookTable imports.
- `openOrders/openOrders.schema.ts` remains only because orderBook.consts and its tests keep raw-open-order helpers. Remove those unused helpers/types/tests (createOrderBookData, getOrderBookPrecisionOptions, getTotalOrderBookLiquidity and exclusively used internals) after confirming the table's depth replacements remain intact. Then delete this schema rather than relocating obsolete models.

Delete after migration:

- Entire MarketsProvider folder, except estateSlugs relocated as described. This includes provider, market.types, market.const, markets.schema, utils/index, createMarketAssetsCollection, transformAssetData, keysToCamelCase, and the two estate JSON files used for inferred types.
- Entire Dexprovider folder after moving live pure utilities/tests. Delete provider/types, schemas/orderbook.schema, storage/storage tests tied to legacy payload shape, calc.ts and aggregateData.ts (no live external consumers found). Keep/rewrite relevant identity/tick fallback assertions as replacement tests.
- `app/hooks/useApiQuery.ts`: DexProvider is its only caller. Keep Apollo's forcedUpdateProxy: other live code still uses it.
- Unmounted PriceSection.tsx, PrimaryPriceBlock.tsx, SecondaryPriceBlock subtree, OTCBuySellScreen.tsx, orphaned AssetTemplates subtree. Remove only styles/assets that lose all references, not shared CSS wholesale.
- Primary-only BuySellContent header/progress branch: its sole live mounting caller supplies a secondary market. Removing that branch also removes the ProgresBar import from PrimaryPriceBlock. Do not create a new progress-bar abstraction to preserve unreachable UI.
- Unused PopupContent alias and commented OTC/slippage scaffolding. SLIPPAGE_OPTIONS has one importer, `PriceSection/components/PercentBlock/PercentBlock.tsx`, but PercentBlock itself has no callers; delete that orphan component before removing the constant.
- `app/mocks/rwas.json` after provider removal if still unreferenced. **Keep app/mocks/assets.mock.json** because the relocated sitemap helper still uses it. Replacing legacy sitemap routes is a separate task.
- Prune raw-open-order-only price helpers/tests once those paths disappear; retain functions used by live depth/trading code. Test-only references are not proof of product usage.

Preserve `PriceSection/popups`, BuySellScreen, BuySellLimitScreen, the metadata hook, trading components, OrderBookTable and the depth-specific orderBook.consts functions. The directory name is legacy; the functionality is live.

## 6. Behavior and risks

- **Trading availability:** an RWA catalog asset without an orderbook is not executable. Resolve configuration locally and display loading/error/unavailable accurately; never submit an empty address/key or assume token ID zero. Preserve `?side=buy|sell` handling and first-order confirmation.
- **Asset switching:** reset form/quote/config state on the actual asset+orderbook identity. Guard against a previous query response or useOrderbookDepth's keepPreviousData being used for a newly selected asset. Check token_address/orderbook_address and quote pair before estimates or submissions.
- **Prices and amounts:** depth prices are display units; contract tick/prices/minimums use atom units. Retain BigNumber rounding-down, base-vs-quote decimal scaling, market-buy budget conversion, minimum checks, tick alignment, nonfinite/zero guards, and side-aware balance checks. Preserve contract market sentinel handling.
- **One-sided books:** generic display price can use the opposite side; actual market placement uses the strict side-specific best ask/bid. Do not enable a market buy with no asks or market sell with no bids merely because a display price exists.
- **Missing tick size:** old Proxy/default logic could permit zero tick and bypass checks. The approved migration intentionally replaces that behavior with explicit unavailability when required config is unresolved. Existing pure tick validators are permissive on absent inputs; add the readiness guard above them.
- **Metadata/balances:** preserve quote-token-specific balance lookup (slug then address) and correct base slug. Trading stablecoin differs from EthereumProvider's Basenet wUSDT bridge destination. Do not alter bridge constants, wallet behavior, KYC or balances to simplify migration.
- **Lifecycle:** retain estimate debouncing/cancellation, wallet signing and status handling, transaction confirmation/reset, toast symbols, and `BuySellPanel.handleSuccessfulTransaction` freshness invalidations for fetchWalletOpenOrders/fetchWalletOrderHistory plus first-order account-status refetch. Reuse existing refetch/freshness mechanisms rather than introducing a second global refresh system.
- **Recommendations:** this is mounted functionality. Keep max two noncurrent real assets, now from AssetsProvider order, without mock fallback. Adapt operationPopupData to current metadata/profile/category/APY and available catalog prices; do not fabricate tags or prices to satisfy EstateType. Missing price should have an explicit display state. Preserve PopupProvider's transaction lifecycle and link to the existing current asset route. Legacy API ranking cannot be preserved exactly because it is being removed; use current catalog order.
- **Loading/errors:** config errors should affect that trade panel, not the whole site. Keep wallet/token/catalog startup gates initially; remove only market/dex gates. Repeated config polling must not blank the page or reset inputs. No silent contract fallback failures.
- **Scope boundaries:** AssetsProvider name cleanup changes its display names; TokensProvider may retain the canonical token name. Treat these as display differences, not a reason to duplicate metadata. Do not migrate RWA_SERVICES_API, API_URL, TOKENS_METADATA_API, or unrelated providers as incidental cleanup.

## 7. Recommended implementation order

1. Establish baseline typecheck/tests; verify selected-orderbook GraphQL fields against the configured endpoint and generate operation types. Resolve current pair identity/config with the approved fallback. Keep old providers mounted while this new path is developed.
2. Move the live pure Dex utilities/tests; introduce the small config query/normalizer/hook and explicit readiness. Reuse metadata and depth hooks. Test identity, units and unavailable states before wiring submissions.
3. Migrate BuySellPanel → BuySellContent → both live screens and metadata hook to AssetType/config. Remove active-market dependence; update recommendations/operationPopupData. Preserve contract entrypoint interfaces.
4. Remove unmounted legacy components/branches and obsolete raw-open-order logic. Relocate live recent-trade modules and sitemap helper. Remove all imports into the soon-to-be-deleted provider directories.
5. Remove root wrappers and AppGlobalLoader dependencies together. Delete provider folders and obsolete API/helper files. Remove MBRWA environment references.
6. Run focused tests, typecheck, lint, and build; smoke-test trading and provider bootstrap with MBRWA unset. Update docs and review diff scope before finalizing.

## 8. Concrete file checklist

All paths relative to repository root; directory entries explicitly cover the related files listed above.

| File(s) | Implementation action |
| --- | --- |
| `app/lib/apis/queries/orderbookConfig.query.ts` (new) | Selected-address GraphQL query; related token IDs, matched currency key, tick and minimums. |
| `app/lib/orderbook/orderbookConfig.types.ts`, `orderbookConfig.ts` (new) | Small config model and validated mapping; no legacy maps/estates. |
| `app/hooks/useOrderbookConfig.ts` (new) | Existing Apollo cache/refetch pattern, selected-book readiness, fallback composition. |
| `app/contracts/orderbookConfig.ts` (new/moved logic) | Verified read-only fallback, typed view mapping; no write operations. |
| `app/lib/orderbook/orderbookPrice.ts`, `orderbookTick.ts`, corresponding tests | Move surviving Dex functions/tests; prune dead exports. |
| `app/utils/__generated__/*` | Regenerate via codegen for the new query, never hand-edit. |
| `app/routes/trade.$address/components/BuySellPanel/BuySellPanel.tsx` | Remove estate search/context/set-active effect; pass asset/config; preserve success invalidation and side selection. |
| `app/routes/trade.$address/route.tsx` | Keep AssetsProvider selection; handle catalog error if exposed; ensure route changes clear stale trade state. |
| `app/lib/organisms/PriceSection/popups/index.tsx` | Remove both contexts and estate types; accept asset/config; switch utility imports; preserve order logic; derive recommendations/toast from current data; delete unreachable primary/OTC branches. |
| `app/lib/organisms/PriceSection/hooks/useOrderbookTokenMetadata.ts` | Remove Dex context/EstateType; resolve slugs from verified config; reuse useAssetMetadata/local fallbacks; no fetch. |
| `app/lib/organisms/PriceSection/screens/BuySellScreen.tsx`, `BuySellLimitScreen.tsx` | Remove SecondaryEstate props; pass explicit token identity/metadata; preserve balances, percentages and validations. |
| `app/contracts/templates/operationPopupData.tsx` | Accept current AssetType/current prices or a minimal card prop; remove legacy constants/types; preserve active recommendation popup. |
| `app/providers/PopupProvider/consts.ts`, `popup.provider.types.ts`, `popup.provider.tsx` | Adjust only affected recommendation payload typing, if needed; preserve popup key/lifecycle. |
| `app/providers/AssetsProvider/assets.provider.tsx`, `assets.provider.types.ts` | Reuse existing state; optionally expose existing asset query error for explicit trade-route error state. Do not add duplicate catalog/config/metadata state. |
| `app/lib/organisms/PriceSection/orderBook.consts.ts`, `orderBook.consts.test.ts` | Retain depth table functions/tests; remove obsolete raw OpenOrder helpers and dependencies. |
| `app/lib/organisms/OrderBookPopup/OrderBookTable.tsx` | Update relocated recent-trade/OrderTypes imports; retain depth/trade behavior. |
| `app/lib/apis/mbrwa/orderbookLastTrades/*` → `app/lib/apis/orderbookLastTrades/*` | Move hook/schema, update imports; keep existing GraphQL query. |
| `app/lib/apis/mbrwa/user/userOrders/order.const.tsx` → `app/lib/orderbook/order.const.ts` | Move live enum/constants and update schema/table imports. |
| `app/lib/apis/mbrwa/openOrders/openOrders.schema.ts` | Delete once unused raw-order helpers/tests are removed. |
| `app/lib/organisms/PriceSection/PriceSection.tsx`, `PrimaryPriceBlock.tsx`, `SecondaryPriceBlock/*`, `screens/OTCBuySellScreen.tsx` | Delete after removing primary progress branch; clean only orphaned styles/imports. |
| `app/lib/organisms/PriceSection/components/PercentBlock/PercentBlock.tsx` | Delete orphan component, then remove its SLIPPAGE_OPTIONS dependency from popups. |
| `app/templates/AssetTemplates/*` | Delete orphan subtree after confirming no new consumers. |
| `app/providers/MarketsProvider/estateSlugs.ts` → `app/lib/sitemap/estateSlugs.ts`; `app/lib/sitemap/sitemap.server.ts` | Relocate helper/update import; preserve existing sitemap behavior. |
| `app/root.tsx` | Remove MarketsProvider/DexProvider imports/wrappers; retain relative order of surviving providers and metadata loader. |
| `app/providers/AppGlobalLoader.tsx` | Remove both context imports/calls/loading terms. |
| `app/providers/MarketsProvider/*`, `app/providers/Dexprovider/*` | Delete remaining provider-specific modules after migrations/moves. |
| `app/lib/apis/mbrwa/assets.ts`, `orderbooks.ts`, `index.ts`; `app/hooks/useApiQuery.ts` | Delete obsolete fetchers and sole-caller hook. |
| `app/mocks/rwas.json` | Delete if final references remain zero; preserve assets.mock.json for sitemap. |
| `vite-env.d.ts`, `wrangler.toml`, local `.env` and deployment env | Remove MBRWA_API only; retain unrelated API config/secrets. |
| `AGENTS.md`, this plan | Update provider structure guidance/completion notes as described below. |

## 9. Validation and completion criteria

- Before changing code, capture baseline `npm run typecheck` and relevant tests so existing failures are identifiable. No tests were run for this documentation-only investigation.
- Preserve/move orderbookPrice/orderbookConfig tests for still-used behavior. Add focused normalization/readiness tests: nonzero FA2 IDs; database row IDs distinct from token IDs; multiple currencies matched by address+ID; zero minimum vs missing; positive integer tick; non-6 quote decimals; missing/mismatched metadata; large atom strings; query/RPC error and retry; cross-asset stale response rejection.
- Keep `app/contracts/orderbook.contract.test.ts`, depth schema tests and depth-based `orderBook.consts.test.ts` coverage. Assert limit/market buy/sell arguments remain equivalent for a known verified pair; no transactions need to be broadcast to validate this refactor.
- Run `npm run test:run`, `npm run typecheck`, `npm run lint`, `npm run build`. If generating GraphQL, note that `npm run graphql-compile` ends with `; true` and masks process failure: inspect output or run the underlying codegen command without that suffix. Build/prebuild can regenerate sitemap output; avoid unrelated generated diffs.
- Smoke-test initial load, catalog/trade route, no-wallet/KYC states, empty/one-sided book, market and limit forms, expiry selection, orderbook popup, asset switch, errors/retry, recommendation popup and transaction callbacks. Ensure refreshing does not reset forms.
- Search production imports for MarketsProvider/Dexprovider/MBRWA_API/mbrwaApiUrl and removed paths. Historical mentions in this plan are expected; runtime/config references are not. Verify no request goes to legacy MBRWA and startup succeeds without that env var.
- The migration is complete when both provider directories/contexts and legacy MBRWA fetchers are gone, live trading uses current asset/metadata/depth/config sources, required unresolved data blocks submissions explicitly, and no mock estate compatibility layer remains in trading.

## Documentation Update

When implementing, update `AGENTS.md` under **Project Structure** to describe AssetsProvider as catalog/display-price owner, TokensProvider as metadata owner, and the selected-orderbook query/hook as execution-config access. Record the chosen helper locations and explicit unavailable behavior. No new R-prefixed components are proposed, so no redesign registry addition is needed. Mark completed checklist entries here and record any verified API/view differences so future chats do not repeat this investigation.


## Implementation record — 2026-09-16

- [x] Selected-address GraphQL operation added and generated with the configured schema (underlying codegen command completed successfully).
- [x] Selected execution config, exact string atom/ID validation, cached per-network/book contract fallback, explicit unavailable/error/retry states added.
- [x] BuySellPanel, BuySellContent, both live screens and existing metadata hook migrated to AssetType/config. Full address+ID slugs, side-specific depth, balance lookups, order expiry, confirmation and success invalidations retained. Stale depth/config and metadata mismatches block orders.
- [x] Recommendations now use at most two noncurrent AssetsProvider assets in catalog order and available USD prices, with an explicit missing-price state. No mock estates/tags are reconstructed; unknown catalog market types are not labeled primary.
- [x] Live arithmetic/tests, recent-trades hook/schema, order constants and sitemap helper relocated. Obsolete raw-open-order helpers/tests and the specified unmounted UI deleted.
- [x] Both provider directories, root wrappers/loading gates, MBRWA fetchers and useApiQuery removed. MBRWA_API removed from tracked deployment config/types and local `.env`/`.dev.vars`. Remote dashboard environment settings were not inspected or changed.
- [x] AGENTS.md provider ownership/helper guidance updated. No redesign registry changes required.

### Verified API/view details

The configured RWA catalog asset `KT1XLUiaPpivxi2e4U1wEctQ7DKDkdz9GQgK` (MARS1) points to book `KT1Xku8NHSXradgodirQXxHLoVn4oESFPjes`. The selected-address GraphQL response matched that base token with FA2 ID `0` and quote `KT1VAymHKvx9oreDRqN22rf2huuYiV5ofe34`, ID `0`, currency key `USDT`. The catalog supplies six decimals for both tokens. GraphQL tick size was `100000`; all four minimums were `1`.

Other currency entries (`USDC`, `rwaToken`) had null token relationships. The resolver ignores those and requires exactly one full address+ID quote match. It never uses the relational rwa_token_id.

A read-only Basenet getConfig view for the same book confirmed `tickSize`, `minBuyOrderAmount`, `minBuyOrderValue`, `minSellOrderAmount`, and `minSellOrderValue`; Taquito returns BigNumbers. The fallback validates these fields and preserves decimal strings. It runs only if required numeric GraphQL settings are missing/invalid, and does not guess identity or currency fields. The catalog's market_type for this asset was `none` despite the valid orderbook, so trading readiness depends on executable configuration; recommendations omit an unknown market badge.

### Validation

- Baseline: 138 tests passed; typecheck already failed in unrelated asset utilities, SecretCover, IdenIcon, useMemoWithCompare, AssetTabs, codegen and the generated server build.
- Refactor: 130 tests pass, including moved live tests and new normalization, metadata, stale identity, query/RPC failure/retry, cache isolation and buy/sell payload tests. The lower total reflects removal of obsolete storage/raw-order tests.
- Production build passed with MBRWA_API unset; local home and selected trade route returned HTTP 200. Production/config import searches found no removed provider/API references. No unrelated sitemap output changed.
- Interactive browser checks (wallet/KYC, form switching, expiry, popup and transaction UI) remain unverified: the available computer tool reported no browser. No transaction was broadcast.
- Typecheck remains blocked by baseline errors; repository-wide lint reports unrelated existing errors. Changed-file lint has no new errors; the pre-existing unused RouteScrollReset in root.tsx remains. Remote deployment dashboard variables remain an operational follow-up if configured outside wrangler.toml.
