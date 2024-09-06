import * as signalR from '@microsoft/signalr';

// types
import {
  UserContext,
  UserTzktTokensBalancesType,
} from '../user.provider.types';

// helpers
import { api } from 'app/lib/utils/api';
import {
  emptyUserTzktAccountSchema,
  userTzktAccountSchema,
  userTzktTokenBalancesSchema,
} from './user.schemes';
import { TokenMetadata } from '~/lib/metadata';
import { getTokenDataByAddress } from '~/providers/TokensProvider/utils/getTokenDataByAddress';
import BigNumber from 'bignumber.js';
import { atomsToTokens } from '~/lib/utils/formaters';
import { toTokenSlug } from '~/lib/assets';

// consts
const REACT_APP_TZKT_API = process.env.API_URL;
const REACT_APP_ENV = process.env.REACT_APP_ENV;

/**
 * nomalize user tokens fetched from tzkt, they have different structure from indexer ones
 */
export const normalizeUserTzktTokensBalances = ({
  userAddress,
  indexerData,
  tokensMetadata,
}: {
  indexerData: UserTzktTokensBalancesType;
  tokensMetadata: StringRecord<TokenMetadata>;
  userAddress: string | null;
}) => {
  const result = indexerData.reduce<
    NonNullable<UserContext['userTokensBalances']>
  >(
    (
      acc,
      {
        balance,
        token: {
          contract: { address: tokenAddress },
        },
        account: { address },
      }
    ) => {
      const token = getTokenDataByAddress({
        tokenAddress: toTokenSlug(tokenAddress),
        tokensMetadata,
      });

      if (!token || userAddress !== address) return acc;
      const { decimals } = token;

      acc[tokenAddress] = atomsToTokens(balance, decimals);
      return acc;
    },
    {}
  );

  return result;
};

/**
 * function to get token balance of the user
 */
export const getUserTokenBalanceByAddress = ({
  userTokensBalances,
  tokenAddress,
}: {
  userTokensBalances: UserContext['userTokensBalances'];
  tokenAddress?: string | null;
}): BigNumber => {
  if (!userTokensBalances || !tokenAddress) return new BigNumber(0);
  return userTokensBalances[tokenAddress] ?? new BigNumber(0);
};

/**
 * load tokens from tzkt api for user, for xtz we need to load user tzkt profile
 *
 * we can get 2 cases here
 *
 * 1. user don't exist, it will return emptyUserTzktAccountSchema response and userTzktTokenBalancesSchema will we just [], so we'll return empty object, no tokens means on tzkt
 * 2. user exists, it will return userTzktAccountSchema with xtz balance data, and userTzktTokenBalancesSchema array of all other tokens, we will normalize them and return
 */
export const fetchTzktUserBalances = async ({
  userAddress,
  tokensMetadata,
}: {
  userAddress: string;
  tokensMetadata: StringRecord<TokenMetadata>;
}) => {
  try {
    const [{ data: tokensData }, { data: accountData }] = await Promise.all([
      api(`${REACT_APP_TZKT_API}/tokens/balances?account.eq=${userAddress}`),
      api(`${REACT_APP_TZKT_API}/accounts/${userAddress}`),
    ]);

    const isUserEmptyOnTzkt = emptyUserTzktAccountSchema.safeParse(accountData);

    if (isUserEmptyOnTzkt.success || Object.keys(tokensMetadata).length === 0)
      return {};

    const parsedUserTzktTokensData =
      userTzktTokenBalancesSchema.safeParse(tokensData);
    const parsedUserXtzTokenBalance =
      userTzktAccountSchema.safeParse(accountData);

    if (parsedUserTzktTokensData.success && parsedUserXtzTokenBalance.success) {
      return normalizeUserTzktTokensBalances({
        indexerData: parsedUserTzktTokensData.data,
        userAddress,
        tokensMetadata,
      });
    }

    throw new Error(
      'Error occured while loading your balances, try to reload the page, or change user'
    );
  } catch (e) {
    // const convertedError = unknownToError(e);
    // throw new ApiError(convertedError);
    console.error(e);
  }
};

// -------- TZKT sockets handlers --------
/**
 * opens websocket connection to tzkt, via signalR library
 * @returns opened socket instance
 */
export const openTzktWebSocket = async (): Promise<signalR.HubConnection> => {
  try {
    const tzktSocket = new signalR.HubConnectionBuilder()
      .withUrl(`${REACT_APP_TZKT_API}/ws`, {
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    // open connection
    await tzktSocket.start();

    return tzktSocket;
  } catch (e) {
    throw new Error("Couldn't open tzkt socket connection");
  }
};

/**
 * subscribe to current user on tzkt websocket
 */
export const attachTzktSocketsEventHandlers = ({
  userAddress,
  handleTokens,
  tzktSocket,
  handleDisconnect,
  handleOnReconnected,
}: {
  userAddress: string;
  handleTokens: (tokens: UserTzktTokensBalancesType) => void;
  tzktSocket: signalR.HubConnection;
  handleDisconnect: (error?: Error) => void;
  handleOnReconnected: (userAddress: string) => void;
}) => {
  tzktSocket.on('token_balances', (msg) => {
    if (!msg.data) return;

    try {
      if (REACT_APP_ENV === 'dev')
        console.log('%ctzktSocket on token_balances msg', 'color: aqua', {
          data: msg.data,
        });
      const tokensBalances = userTzktTokenBalancesSchema.parse(msg.data);
      handleTokens(tokensBalances);
    } catch (e) {
      if (REACT_APP_ENV === 'dev')
        console.error('tzkt tokens balance parse error: ', { e, msg });
    }
  });

  // subscribe to account's tokens
  tzktSocket.invoke('SubscribeToTokenBalances', {
    account: userAddress,
  });

  // subscribe to account data to get xtz balance ):
  tzktSocket.invoke('SubscribeToAccounts', {
    addresses: [userAddress],
  });

  tzktSocket.onclose(handleDisconnect);
  tzktSocket.onreconnecting(handleDisconnect);
  tzktSocket.onreconnected(() => handleOnReconnected(userAddress));
};
