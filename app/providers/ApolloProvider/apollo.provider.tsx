import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ApolloClient,
  InMemoryCache,
  from,
  ApolloProvider as OriginalApolloProvider,
  ApolloError,
} from "@apollo/client/index";

import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev/index";

import { onError } from "@apollo/client/link/error";

// types
import { ApolloContext } from "./apollo.provider.types";

// consts
import { httpLink, retryLink, splitLink } from "./apollo.config";
import { ApiError, isAbortError } from "~/errors/error";

// hooks
import { useToasterContext } from "../ToasterProvider/toaster.provider";
import { useAppContext } from "../AppProvider/AppProvider";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

if (process.env.NODE_ENV === "development") {
  loadDevMessages();
  loadErrorMessages();
}

// context
const apolloContext = createContext<ApolloContext>(undefined!);

type Props = {
  children: React.ReactNode;
};

export const ApolloProvider = ({ children }: Props) => {
  const { IS_WEB } = useAppContext();
  const { bug } = useToasterContext();
  const [hasNetworkError, setHasNetworkError] = useState(false);

  const errorLink = useMemo(
    () =>
      onError(({ networkError, graphQLErrors }) => {
        if (isAbortError(networkError)) return;

        if (graphQLErrors) {
          for (const { message, locations, path } of graphQLErrors) {
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
          }
        }

        if (networkError) {
          console.log(`[Network error]: ${networkError}`);

          if (typeof window !== "undefined" && !window.navigator.onLine) {
            bug("Sorry, your browser is offline.");
          } else {
            if (hasNetworkError) bug(new ApiError("Server is disabled."));

            setHasNetworkError(true);
          }
        }
      }),
    [hasNetworkError]
  );

  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        link: IS_WEB
          ? from([
              errorLink,
              retryLink,
              splitLink(
                new GraphQLWsLink(
                  createClient({
                    url: process.env.GRAPHQL_WS_API ?? "",
                  })
                ),
                httpLink
              ),
            ])
          : undefined,
        cache: new InMemoryCache(),
      }),
    [errorLink, IS_WEB]
  );

  const handleApolloError = useCallback(
    (error: ApolloError, subName: string, bugMessage = "") => {
      if (isAbortError(error.networkError)) return;

      console.error(`${subName} query error: `, bugMessage, error);
    },
    []
  );

  const context = useMemo(
    () => ({
      apolloClient,
      handleApolloError,
    }),
    [apolloClient, handleApolloError]
  );

  return (
    <apolloContext.Provider value={context}>
      <OriginalApolloProvider client={apolloClient}>
        {children}
      </OriginalApolloProvider>
    </apolloContext.Provider>
  );
};

export const useApolloContext = () => {
  const context = useContext(apolloContext);
  if (!context) {
    throw new Error("useApolloContext should be used within ApolloProvider");
  }

  return context;
};
