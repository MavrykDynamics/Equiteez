import {
  BitcoinMiners,
  Commodities,
  Debt,
  Hotel,
  InsuranceContract,
  MixedUseRealEstate,
  Resort,
  Treasuries,
} from "~/consts/asset.const";
import {
  BitCoinMinersTemplate,
  CommoditiesTemplate,
  DebtTemplate,
  HotelTemplate,
  InsuranceContractTemplate,
  MixedUseRealEstateTemplate,
  ResortTemplate,
  TreasuriesTemplate,
} from "./AssetTemplates";

export * from "./AssetTemplates";

export const pickTemplateBasedOnAssetType = {
  [BitcoinMiners]: BitCoinMinersTemplate,
  [Hotel]: HotelTemplate,
  [Resort]: ResortTemplate,
  [Debt]: DebtTemplate,
  [Treasuries]: TreasuriesTemplate,
  [InsuranceContract]: InsuranceContractTemplate,
  [Commodities]: CommoditiesTemplate,
  [MixedUseRealEstate]: MixedUseRealEstateTemplate,
};
