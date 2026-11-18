/**
 * Reads an FA2 operator grant from the token's `operators` big map, keyed
 * (owner, operator, token_id) on our tokens. Read from the RPC head rather
 * than the indexer, so a grant made moments ago is not missed.
 */

type OperatorKey = { 0: string; 1: string; 2: string };

type TokenWithOperators = {
  storage: <T>() => Promise<T>;
};

type OperatorsStorage = {
  operators?: { get: (key: OperatorKey) => Promise<unknown> };
};

/** The grant could not be read: never guess either way. */
export class OperatorReadError extends Error {
  constructor(cause?: unknown) {
    super("Couldn't read the token permissions. Please try again.");
    this.name = "OperatorReadError";
    this.cause = cause;
  }
}

export async function hasActiveOperator(
  token: TokenWithOperators,
  {
    owner,
    operator,
    tokenId,
  }: { owner: string; operator: string; tokenId: string }
): Promise<boolean> {
  try {
    const storage = await token.storage<OperatorsStorage>();

    if (typeof storage?.operators?.get !== "function") {
      throw new Error("Token storage has no operators big map");
    }

    // unit value when present, undefined when absent
    const grant = await storage.operators.get({
      0: owner,
      1: operator,
      2: tokenId,
    });

    return grant !== undefined;
  } catch (error) {
    throw new OperatorReadError(error);
  }
}
