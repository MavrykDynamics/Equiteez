import primaryEstate from './primaryEstate.mock.json';
import secondaryEstate from './secondaryEstate.mock.json';

export type PrimaryEstate = (typeof primaryEstate)[0];
export type SecondaryEstate = (typeof secondaryEstate)[0];

export const SECONDARY_MARKET = 'Secondary Market';
export const PRIMARY_ISSUANCE = 'Primary Issuance';

export type EstatesContext = {
  estates: (PrimaryEstate | SecondaryEstate)[];
  activeEstate: PrimaryEstate | SecondaryEstate | null;
  isActiveEstateSecondaryMarket: boolean;
  isLoading: boolean;
  isActiveEstateLoading: boolean;
  pickEstateByAddress: (
    address: string
  ) => PrimaryEstate | SecondaryEstate | null;
  setActiveEstate: (address: string) => void;
};
