import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchPublicWalletPortfolio } from "~/lib/apis/rwa";
import type { PublicWalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RPriceChange } from "~/lib/molecules/RPriceChange";
import { Spinner } from "~/lib/atoms/Spinner";
import { toTokenSlug } from "~/lib/assets";
import { PortfolioValueChart } from "~/routes/portfolio._index/components/PortfolioGeneralStats/PortfolioValueChart";
import { AssetIcon } from "~/templates/AssetIcon";

import styles from "./styles.module.css";

function MobileAssetRow({ asset }: { asset: PublicWalletPortfolioAssetType }) {
  return (
    <div className={styles.assetRow}>
      <div className={styles.assetIdentity}>
        <AssetIcon
          assetSlug={toTokenSlug(asset.token_address)}
          className={styles.assetIcon}
          size={30}
        />
        <span className={styles.assetName}>
          <RText className={styles.assetSymbol} size="body-sm">
            {asset.symbol.toUpperCase()}
          </RText>
          <RText
            className={styles.assetTitle}
            color="neutral-700"
            size="body-s"
            title={asset.name}
          >
            {asset.name}
          </RText>
        </span>
      </div>
      <div className={styles.assetAmount}>
        <RText size="body-sm" weight="medium">
          $
          <Money fiat tooltip={false}>
            {asset.value}
          </Money>
        </RText>
        <RText color="neutral-700" size="body-s">
          <Money fiat tooltip={false}>
            {asset.balance}
          </Money>
        </RText>
      </div>
    </div>
  );
}

export function MobilePortfolio() {
  const [address, setAddress] = useState("");
  const [activeAddress, setActiveAddress] = useState("");
  const [search, setSearch] = useState("");
  const [isAmountDescending, setIsAmountDescending] = useState(true);

  const portfolioQuery = useQuery({
    queryKey: ["rwa-public-wallet-portfolio", activeAddress],
    queryFn: () => fetchPublicWalletPortfolio({ walletAddress: activeAddress }),
    retry: false,
    enabled: Boolean(activeAddress),
  });

  const isLoading = portfolioQuery.isLoading || portfolioQuery.isFetching;
  const hasPortfolio = Boolean(activeAddress && portfolioQuery.data);
  const assets = portfolioQuery.data?.assets;
  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matchingAssets = (assets ?? []).filter(
      (asset) =>
        !query ||
        asset.name.toLowerCase().includes(query) ||
        asset.symbol.toLowerCase().includes(query)
    );

    return [...matchingAssets].sort((first, second) =>
      isAmountDescending
        ? second.value - first.value
        : first.value - second.value
    );
  }, [assets, isAmountDescending, search]);

  function submitAddress() {
    const nextAddress = address.trim();

    if (!nextAddress) return;

    setActiveAddress(nextAddress);
  }

  function handleAssetSearch(value: string) {
    setSearch(value);
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.walletSearch}
        aria-label="Wallet portfolio lookup"
      >
        <RText color="neutral-700" size="body-sm">
          Enter a wallet address to view statistics and activity.
        </RText>
        <div className={styles.addressControls}>
          <div className={styles.addressField}>
            <RText id="mobile-wallet-address-label" size="body-sm">
              Wallet Address
            </RText>
            <RInput
              aria-labelledby="mobile-wallet-address-label"
              onChange={(event) => setAddress(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitAddress();
              }}
              placeholder="Enter Address"
              value={address}
            />
          </div>
          <button
            aria-label="Search wallet address"
            className={styles.searchButton}
            disabled={!address.trim()}
            onClick={submitAddress}
            type="button"
          >
            <RIcon aria-hidden="true" name="search" size="medium" />
          </button>
        </div>
      </section>

      {hasPortfolio ? (
        <>
          <section
            className={styles.portfolioCard}
            aria-label="Portfolio summary"
          >
            <div className={styles.portfolioValue}>
              <RText color="neutral-700" size="body-s" weight="medium">
                Total Portfolio Value
              </RText>
              <RHeading size="h4" weight="medium">
                {isLoading ? (
                  "--"
                ) : (
                  <>
                    $
                    <Money fiat tooltip={false}>
                      {portfolioQuery.data?.total_value ?? 0}
                    </Money>
                  </>
                )}
              </RHeading>
              <RPriceChange
                amount={portfolioQuery.data?.change_24h_abs}
                percentage={portfolioQuery.data?.change_24h_pct}
                showPeriodLabel={true}
                size="body-s"
              />
            </div>
            <PortfolioValueChart
              allowUnauthenticated
              mobile
              walletAddress={activeAddress}
            />
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <RText color="neutral-700" size="body-s" weight="medium">
                  Total Growth
                </RText>
                <RHeading
                  className={styles.growthValue}
                  size="h5"
                  weight="medium"
                >
                  {/*+*/}
                  {/*<Money fiat tooltip={false}>*/}
                  {/*  3*/}
                  {/*</Money>*/}
                  {/*%*/}
                  --
                </RHeading>
                <RText color="neutral-700" size="body-s">
                  Asset growth + dividends
                </RText>
              </div>
              <div className={styles.metric}>
                <RText color="neutral-700" size="body-s" weight="medium">
                  Dividends Earned
                </RText>
                <RHeading size="h5" weight="medium">
                  {/*$*/}
                  {/*<Money fiat tooltip={false}>*/}
                  {/*  6_853*/}
                  {/*</Money>*/}
                  --
                </RHeading>
                <RText color="neutral-700" size="body-s">
                  Paid in your wallet
                </RText>
              </div>
              <div className={styles.metric}>
                <RText color="neutral-700" size="body-s" weight="medium">
                  Est. Net Yield
                </RText>
                <RHeading
                  className={styles.yieldValue}
                  size="h5"
                  weight="medium"
                  color="accent-green-500"
                >
                  <Money fiat tooltip={false}>
                    {portfolioQuery.data?.est_net_yield_pct ?? 0}
                  </Money>
                  %
                </RHeading>
                <RText color="neutral-700" size="body-s">
                  Blended across holdings
                </RText>
              </div>
            </div>
          </section>

          <section className={styles.assetsCard} aria-label="Portfolio assets">
            <RText size="body-m" weight="medium">
              Portfolio
            </RText>
            <RInput
              aria-label="Search asset"
              className={styles.assetSearch}
              icon="search"
              iconSize="small"
              onChange={(event) => handleAssetSearch(event.target.value)}
              placeholder="Search Asset"
              type="search"
              value={search}
            />
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <RText color="neutral-700" size="body-xs" weight="medium">
                  Asset
                </RText>
                <button
                  aria-label="Sort assets by amount"
                  className={styles.amountHeader}
                  onClick={() => setIsAmountDescending((value) => !value)}
                  type="button"
                >
                  <RText color="neutral-700" size="body-xs" weight="medium">
                    Amount
                  </RText>
                  <RIcon
                    aria-hidden="true"
                    name="sort"
                    size="small"
                    sortDirection={
                      isAmountDescending ? "descending" : "ascending"
                    }
                  />
                </button>
              </div>
              {isLoading ? (
                <div className={styles.assetsLoader} role="status">
                  <Spinner size={28} />
                </div>
              ) : filteredAssets.length ? (
                filteredAssets.map((asset) => (
                  <MobileAssetRow asset={asset} key={asset.token_address} />
                ))
              ) : (
                <RText
                  className={styles.emptyAssets}
                  color="neutral-700"
                  size="body-sm"
                >
                  No assets found
                </RText>
              )}
            </div>
          </section>
        </>
      ) : null}

      {portfolioQuery.isError ? (
        <RText className={styles.error} color="red-500" size="body-sm">
          Unable to load this wallet. Check the address and try again.
        </RText>
      ) : null}
    </main>
  );
}
