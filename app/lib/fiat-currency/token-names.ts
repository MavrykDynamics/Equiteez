/**
 *
 * @param tokenGqlSymbol symbol of token in GQL or feed name to use tokens symbol for interaction on frontend, cuz addresses can have identical metadata, that is not ok
 * @returns null if token is not used, or {name, symbol} obj for token, if it's used
 *
 * need to do this mapper cuz back-end can't send valid names and it can have token duplicates
 */
export const getTokenSymbolAndName = (tokenGqlSymbol: string) => {
  switch (tokenGqlSymbol.toLowerCase()) {
    case 'usdt/usd':
    case 'usdt':
      return { name: 'Tether', symbol: 'USDT', icon: '/images/usdt.png' };
    case 'musdt':
      return { name: 'mUSDT', symbol: 'mUSDT', icon: '/images/mUSDT.svg' };

    case 'mvrk/usd':
    case 'mvrk':
      return { name: 'Mavryk', symbol: 'MVRK', icon: '/images/MVRK_token.svg' };
    case 'mmvrk':
      return {
        name: 'mMVRK',
        symbol: 'mMVRK',
        icon: '/images/mMVRK_token.svg',
      };

    case 'btc/usd':
    case 'wbtc':
      return { name: 'wBTC', symbol: 'wBTC', icon: '/images/tzBTC.png' };
    case 'mwbtc':
      return { name: 'mWBTC', symbol: 'mWBTC', icon: '/images/mTzBTC.svg' };
    case 'eurt/usd':
    case 'euroc/usd':
    case 'eurc/usd':
    case 'eurl':
      return { name: 'Eurocoin', symbol: 'EURL', icon: '/images/eurl.png' };
    case 'meurl':
      return { name: 'mEURL', symbol: 'mEURL', icon: '/images/mEURL.svg' };
    case 'mvn':
      return { name: 'Maven', symbol: 'MVN', icon: '/images/MVN_token.svg' };
    case 'smvn':
      return {
        name: 'Staked Maven',
        symbol: 'sMVN',
        icon: '/images/sMVN_token.svg',
      };
    case 'ocean/usd':
    case 'ocean':
      return {
        name: 'Ocean',
        symbol: 'OCEAN',
        icon: '/images/ocean_token.png',
      };

    case 'mars1/usd':
    case 'mars1':
      return {
        name: 'Mars1',
        symbol: 'MARS1',
        icon: '/images/mars_token.jpeg',
      };

    default:
      return null;
  }
};
