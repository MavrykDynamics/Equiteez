import {
  UserContextStateType,
  UserTzKtTokenBalances,
} from "../user.provider.types";

export const DEFAULT_USER: UserContextStateType = {
  userAddress: null,
  userTokensBalances: {},
  isAdmin: false,
  isKyced: false,
};

export const DEFAULT_USER_TZKT_TOKENS: UserTzKtTokenBalances = {
  userAddress: null,
  tokens: {},
};

// admin addresses proxy
function createAddressObject(trueAddresses: Array<string>) {
  return new Proxy(
    {},
    {
      get: (_, address: string) => {
        return trueAddresses.includes(address);
      },
    }
  );
}

// API dont have roles, herre is a hardcoded list of admin addresses
export const ADMIN_ADDRESSES: StringRecord<boolean> = createAddressObject([
  "mv1TMgthRwT69X8WMqRyeMYLPEcoEfCKqX2w",
  "mv1Q3DyGiVYDrRj5PrUVQkTA1LHwYy8gHwQV",
  "mv1DXLvsp4T7X6gXLHn7szGN7WLooy14fQ3G",
]);
