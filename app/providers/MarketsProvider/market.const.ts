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
