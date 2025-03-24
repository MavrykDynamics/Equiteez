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
import { FatalError, isAbortError } from "~/errors/error";

// hooks
import { TOASTER_TEXTS } from "../ToasterProvider/helpers/texts/toaster.texts";
import { TOASTER_SUBSCRIPTION_ERROR } from "../ToasterProvider/toaster.provider.const";
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
  const { bug, fatal } = useToasterContext();
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
            if (hasNetworkError) fatal(new FatalError("Server is disabled."));

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
                    url: process.env.GRAPHQL_WSS_API ?? "",
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
    (error: ApolloError, subName: string, bugMessage?: string) => {
      if (isAbortError(error.networkError)) return;

      console.error(`${subName} query error: `, error);
      bug(
        TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]["message"],
        bugMessage ?? TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]["title"]
      );
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
