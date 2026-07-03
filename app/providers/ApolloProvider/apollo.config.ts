import { split } from "@apollo/client/index";
import { HttpLink } from "@apollo/client/link/http";
import { RetryLink } from "@apollo/client/link/retry";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
// import { createClient } from 'graphql-ws';
import { getMainDefinition } from "@apollo/client/utilities";
import { isAbortError } from "~/errors/error";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const isLocalHostname = () =>
  typeof window !== "undefined" && LOCAL_HOSTNAMES.has(window.location.hostname);

export const getGraphqlHttpUri = () => {
  const graphqlApi = process.env.GRAPHQL_API ?? "";
  const bypassSecret = process.env.INDEXER_ALLOWLIST_BYPASS_SECRET;

  if (!graphqlApi || !isLocalHostname() || !bypassSecret) {
    return graphqlApi;
  }

  const graphqlApiUrl = new URL(graphqlApi);
  graphqlApiUrl.searchParams.set("bypass", bypassSecret);

  return graphqlApiUrl.toString();
};

// apollo client setup
export const httpLink = new HttpLink({
  uri: getGraphqlHttpUri,
});

export const splitLink = (wsLink: GraphQLWsLink, httpLink: HttpLink) =>
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

export const retryLink = new RetryLink({
  attempts: {
    max: 3,
    retryIf: (error) => !isAbortError(error),
  },
});
