import {
  UserContextStateType,
  UserTzKtTokenBalances,
} from '../user.provider.types';

export const DEFAULT_USER: UserContextStateType = {
  userAddress: null,
  userTokensBalances: {},
  isAdmin: false,
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

export const ADMIN_ADDRESSES: StringRecord<boolean> = createAddressObject([
  'mv1TMgthRwT69X8WMqRyeMYLPEcoEfCKqX2w',
  'mv1Q3DyGiVYDrRj5PrUVQkTA1LHwYy8gHwQV',
]);
