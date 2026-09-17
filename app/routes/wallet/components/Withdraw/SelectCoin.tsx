import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import { InputWithIcons } from "~/lib/organisms/InputWithIcons/InputWithIcons";
import SearchIcon from "app/icons/search.svg?react";
import { stablecoinContract } from "~/consts/contracts";
import { MVRK_CONTRACT_ADDRESS } from "~/lib/metadata";
import styles from "./styles.module.css";
import { AssetIcon } from "~/templates/AssetIcon";
import { Icon } from "~/lib/atoms/Icon";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { toTokenSlug } from "~/lib/assets";
import { useUserAssetsContext } from "~/providers/UserAssets/userAssets.provider";

const fixedAddresses = [stablecoinContract, MVRK_CONTRACT_ADDRESS];

export function AssetView({ tokenAddress }: { tokenAddress: string }) {
  const { tokensMetadata } = useTokensContext();

  const tokenSlug = toTokenSlug(tokenAddress);
  const token = tokensMetadata[tokenSlug];

  if (!token) return null;

  return (
    <div className="flex items-center gap-[8px]">
      <AssetIcon
        key={tokenSlug}
        size={24}
        assetSlug={tokenSlug}
        className="w-[24px] h-[24px] rounded-[4px] overflow-hidden"
      />
      <Text size="smallBody">{token.symbol}</Text>
    </div>
  );
}

export function SelectCoin({
  tokenAddress,
  error,
  setTokenAddress,
}: {
  tokenAddress: string;
  error: boolean;
  setTokenAddress: (value: string) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const term = useMemo(() => searchValue.trim().toLowerCase(), [searchValue]);
  const { userAssets } = useUserAssetsContext();

  const filteredTokens = useMemo(
    () =>
      userAssets
        .filter((item) => {
          if (!term.length) return true;
          return (
            item.token.address.toLowerCase().includes(term) ||
            item.token.symbol.toLowerCase().includes(term) ||
            item.token.name.toLowerCase().includes(term)
          );
        })
        .slice(0, 3),
    [userAssets, term]
  );

  const selectedAsset = useMemo(() => {
    if (!tokenAddress) return null;
    return (
      userAssets.find((item) => item.token.address === tokenAddress) || null
    );
  }, [userAssets, tokenAddress]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex w-full flex-col gap-[8px]" ref={wrapperRef}>
      <Text size="smallBody">Select Coin</Text>
      {selectedAsset ? (
        <div>
          <div className={styles.textItem}>
            <div className="flex items-center gap-[10px]">
              <SearchIcon className={styles.searchIcon} />

              <AssetView tokenAddress={selectedAsset.token.address} />
            </div>
            <div
              onClick={() => setTokenAddress("")}
              className="flex items-center justify-center cursor-pointer w-[24px] h-[24px] bg-[var(--color-grey-100)] rounded-full"
            >
              <Text>
                <Icon className="w-[16px]" icon="cross" />
              </Text>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <InputWithIcons
            onFocus={() => setIsFocused(true)}
            className="h-[45px]"
            placeholder="Search"
            errorCaption={error ? "Select token" : ""}
            value={searchValue}
            showSearchIcon
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {isFocused && (
            <div className={styles.selectCoinList}>
              {filteredTokens.length ? (
                filteredTokens.map((item) => (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTokenAddress(item.token.address);
                      setIsFocused(false);
                    }}
                    className={styles.selectCoinListItem}
                    key={item.token.address}
                  >
                    <AssetIcon
                      key={item.tokenSlug}
                      size={32}
                      assetSlug={item.tokenSlug}
                      className="w-[32px] h-[32px] rounded-[4px] overflow-hidden"
                    />
                    <div>
                      {fixedAddresses.includes(item.token.address) ? (
                        <Text
                          size="smallBody"
                          weight="semibold"
                          className={styles.tokenItemText}
                        >
                          {item.token.symbol}
                        </Text>
                      ) : (
                        <div className="flex flex-col">
                          <Text
                            size="smallBody"
                            weight="semibold"
                            className={styles.tokenItemText}
                          >
                            {item.token.name}
                          </Text>
                          <Text size="tinyBody" color="lightSand">
                            {item.token.symbol}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <Text weight="bold" className="p-[16px]">
                  Not found
                </Text>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
