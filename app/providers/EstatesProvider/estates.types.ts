import primaryEstate from "./primaryEstate.mock.json";
import secondaryEstate from "./secondaryEstate.mock.json";

export type PrimaryEstate = (typeof primaryEstate)[0];
export type SecondaryEstate = (typeof secondaryEstate)[0];

export type EstateType = PrimaryEstate | SecondaryEstate;

export const SECONDARY_MARKET = "Secondary Market";
export const PRIMARY_ISSUANCE = "Primary Issuance";

export type EstatesContext = {
  estates: StringRecord<EstateType>;
  estatesArr: EstateType[];
  estateAddresses: string[];
  activeEstate: EstateType | null;
  isActiveEstateSecondaryMarket: boolean;
  isLoading: boolean;
  isActiveEstateLoading: boolean;
  pickEstateByIdentifier: (address: string) => EstateType | null;
  setActiveEstate: (address: string) => void;
};
