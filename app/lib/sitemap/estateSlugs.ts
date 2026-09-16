import estatesMocked from "app/mocks/assets.mock.json";

export const estateSlugs = estatesMocked
  .map((estate) => estate.assetDetails.blockchain[0]?.identifier)
  .filter(
    (slug): slug is string => typeof slug === "string" && slug.length > 0
  );
