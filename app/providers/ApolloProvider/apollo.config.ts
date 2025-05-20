import { split } from "@apollo/client/index";
import { HttpLink } from "@apollo/client/link/http";
import { RetryLink } from "@apollo/client/link/retry";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
// import { createClient } from 'graphql-ws';
import { getMainDefinition } from "@apollo/client/utilities";
import { isAbortError } from "~/errors/error";

// apollo client setup
export const httpLink = new HttpLink({
  uri: process.env.GRAPHQL_API ?? "",
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
