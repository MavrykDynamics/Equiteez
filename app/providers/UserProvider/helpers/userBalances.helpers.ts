import * as signalR from '@microsoft/signalr';

// types
import {
  UserContext,
  UserTzktTokensBalancesType,
} from './../user.provider.types';

// helpers
import { api } from 'app/utils/api';
// import { ApiError, unknownToError } from 'errors/error';
import {
  emptyUserTzktAccountSchema,
  userTzktAccountSchema,
  userTzktTokenBalancesSchema,
} from './user.schemes';

// consts
const REACT_APP_TZKT_API = process.env.REACT_APP_TZKT_API;
const REACT_APP_ENV = process.env.REACT_APP_ENV;

/**
 * function to get token balance of the user
 */
export const getUserTokenBalanceByAddress = ({
  userTokensBalances,
  tokenAddress,
}: {
  userTokensBalances: UserContext['userTokensBalances'];
  tokenAddress?: string | null;
}): number => {
  if (!userTokensBalances || !tokenAddress) return 0;
  return userTokensBalances[tokenAddress] ?? 0;
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
}: {
  userAddress: string;
}) => {
  try {
    const [{ data: tokensData }, { data: accountData }] = await Promise.all([
      api(`${REACT_APP_TZKT_API}/v1/tokens/balances?account.eq=${userAddress}`),
      api(`${REACT_APP_TZKT_API}/v1/accounts/${userAddress}`),
    ]);

    const isUserEmptyOnTzkt = emptyUserTzktAccountSchema.safeParse(accountData);

    if (isUserEmptyOnTzkt.success) return {};

    const parsedUserTzktTokensData =
      userTzktTokenBalancesSchema.safeParse(tokensData);
    const parsedUserXtzTokenBalance =
      userTzktAccountSchema.safeParse(accountData);

    if (parsedUserTzktTokensData.success && parsedUserXtzTokenBalance.success) {
      // return normalizeUserTzktTokensBalances({
      //   indexerData: parsedUserTzktTokensData.data,
      //   userAddress,
      //   tokensMetadata,
      // });
      return {};
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
      .withUrl(`${REACT_APP_TZKT_API}/v1/ws`, {
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    // open connection
    await tzktSocket.start();

    return tzktSocket;
  } catch (e) {
    throw new Error("Couldn't open tzkt socket connection");
    console.error(e);
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
