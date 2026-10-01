import { BigNumber } from "bignumber.js";
import { z } from "zod";
import {
  fetchGetOperationsTransactions,
  type TzktApiChainId,
} from "~/lib/apis/tzkt";

export const PRIMARY_HISTORY_QUERY_KEY = "primary-purchase-history";
const nat = z.string().regex(/^\d+$/);
const operationSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  hash: z.string(),
  counter: z.number().int(),
  timestamp: z.string().datetime(),
  status: z.string(),
  sender: z.object({ address: z.string() }),
  target: z.object({ address: z.string() }).optional(),
  parameter: z.unknown().optional(),
  diffs: z
    .array(
      z.object({
        path: z.string(),
        content: z.object({ key: z.unknown(), value: z.unknown() }),
      })
    )
    .optional(),
});
const purchaseSchema = z.object({
  entrypoint: z.literal("purchase"),
  value: z.object({
    amount: nat,
    launchName: z.string(),
    saleOption: z.string(),
    payment: z.string(),
  }),
});
const launchSchema = z.object({
  tokenContractAddress: z.string(),
  saleOptions: z.record(
    z.object({
      payments: z.record(
        z.object({
          currency: z.object({
            fa2: z.object({ tokenContractAddress: z.string(), tokenId: nat }),
          }),
        })
      ),
    })
  ),
});
const transfersSchema = z.object({
  entrypoint: z.literal("transfer"),
  value: z.array(
    z.object({
      from_: z.string(),
      txs: z.array(z.object({ to_: z.string(), amount: nat, token_id: nat })),
    })
  ),
});

export type PrimaryPurchaseHistoryItem = {
  id: number;
  datetime: string;
  amount: string;
  price: string;
  total: string;
};

/** Use historical launch identity and actual payment legs, never the signed cap or live price. */
export function parsePrimaryPurchaseHistoryItem({
  operations,
  purchaseId,
  wallet,
  assetAddress,
  launchpad,
  paymentAddress,
  paymentTokenId,
}: {
  operations: unknown;
  purchaseId: number;
  wallet: string;
  assetAddress: string;
  launchpad: string;
  paymentAddress: string;
  paymentTokenId: string;
}): PrimaryPurchaseHistoryItem | null {
  const group = z.array(operationSchema).parse(operations);
  const purchase = group.find((operation) => operation.id === purchaseId);
  if (
    !purchase ||
    purchase.status !== "applied" ||
    purchase.sender.address !== wallet ||
    purchase.target?.address !== launchpad
  )
    throw new Error("Unable to verify the purchase operation.");
  const { value } = purchaseSchema.parse(purchase.parameter);
  const launchDiff = purchase.diffs?.find(
    (diff) =>
      diff.path === "launchLedger" && diff.content.key === value.launchName
  );
  if (!launchDiff)
    throw new Error("Historical launch details are unavailable.");
  // A wallet can purchase several assets from the same launchpad.
  const identity = z
    .object({ tokenContractAddress: z.string() })
    .parse(launchDiff.content.value);
  if (identity.tokenContractAddress !== assetAddress) return null;
  const launch = launchSchema.parse(launchDiff.content.value);
  const payment =
    launch.saleOptions[value.saleOption]?.payments[value.payment]?.currency.fa2;
  if (
    !payment ||
    payment.tokenContractAddress !== paymentAddress ||
    payment.tokenId !== paymentTokenId
  )
    throw new Error("The historical purchase currency is unsupported.");
  let total = 0n;
  let hasPayment = false;
  for (const operation of group) {
    if (
      operation.type !== "transaction" ||
      operation.status !== "applied" ||
      operation.hash !== purchase.hash ||
      operation.counter !== purchase.counter ||
      operation.sender.address !== launchpad ||
      operation.target?.address !== paymentAddress
    )
      continue;
    const transfers = transfersSchema.parse(operation.parameter);
    for (const transfer of transfers.value) {
      if (transfer.from_ !== wallet) continue;
      for (const tx of transfer.txs) {
        if (tx.token_id !== paymentTokenId) continue;
        hasPayment = true;
        total += BigInt(tx.amount);
      }
    }
  }
  if (!hasPayment || BigInt(value.amount) === 0n)
    throw new Error("Historical purchase payment details are incomplete.");
  const amount = new BigNumber(value.amount).shiftedBy(-6);
  const paid = new BigNumber(total.toString()).shiftedBy(-6);
  return {
    id: purchase.id,
    datetime: purchase.timestamp,
    amount: amount.toFixed(),
    price: paid.dividedBy(amount).toFixed(),
    total: paid.toFixed(),
  };
}

export async function fetchPrimaryPurchaseHistory({
  chainId,
  wallet,
  launchpad,
  loadOperation,
  ...identity
}: {
  chainId: TzktApiChainId;
  wallet: string;
  launchpad: string;
  assetAddress: string;
  paymentAddress: string;
  paymentTokenId: string;
  loadOperation: (hash: string) => Promise<unknown>;
}): Promise<PrimaryPurchaseHistoryItem[]> {
  const items: PrimaryPurchaseHistoryItem[] = [];
  const limit = 100;
  let lastId: number | undefined;
  for (;;) {
    const operations = z.array(operationSchema).parse(
      await fetchGetOperationsTransactions(chainId, {
        sender: wallet,
        target: launchpad,
        entrypoint: "purchase",
        status: "applied",
        "sort.desc": "id",
        limit,
        "id.lt": lastId,
      })
    );
    // Bound concurrent detail requests; the caller caches immutable operation groups.
    for (let index = 0; index < operations.length; index += 10) {
      const batch = await Promise.all(
        operations.slice(index, index + 10).map(async (operation) =>
          parsePrimaryPurchaseHistoryItem({
            operations: await loadOperation(operation.hash),
            purchaseId: operation.id,
            wallet,
            launchpad,
            ...identity,
          })
        )
      );
      items.push(
        ...batch.filter(
          (item): item is PrimaryPurchaseHistoryItem => item !== null
        )
      );
    }
    if (operations.length < limit) return items;
    const nextId = operations[operations.length - 1].id;
    if (lastId !== undefined && nextId >= lastId)
      throw new Error("Purchase history pagination did not advance.");
    lastId = nextId;
  }
}
