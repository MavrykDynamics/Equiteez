// admin addresses proxy
function createEstatesObject(trueAssetsList: Array<string>) {
  return new Proxy(
    {},
    {
      get: (_, address: string) => {
        return trueAssetsList.includes(address);
      },
    }
  );
}

export const STATIC_ASSETS_LIST: StringRecord<boolean> = createEstatesObject([
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9",
  "KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh",
]);

export const SECONDARY_MARKET = "Secondary Market";
export const PRIMARY_ISSUANCE = "Primary Issuance";

export const MARKETS_INITIAL_STATE = {
  config: {
    dodoMav: new Map(), // dodoContract -> {adddress, baseToken, quoteToken, quoteLpToken, baseLpToken}
    orderbook: new Map(),
  },
  markets: new Map(),
  isLoading: true,
};

export const MARKETS_PAGINATION_LIMIT = 1;
