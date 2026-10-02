import { OpKind, type MavrykToolkit } from "@mavrykdynamics/taquito";
import { getPrimaryDeployment } from "./primaryPurchase.config";
import { readPrimaryPurchaseConfig } from "./primaryPurchase.read";
import {
  quotePrimaryPurchase,
  validatePrimaryAmount,
} from "./primaryPurchase.quote";
import { primaryPurchaseError } from "./primaryPurchase.errors";
import { toNatString } from "~/lib/utils/formaters";
import type {
  ChainLedger,
  ChainNat,
  PrimaryPurchaseReview,
} from "./primaryPurchase.types";
import type { BatchOperationKindType } from "./types";
import type { ContractActionLifecycleCallbacks } from "./actions.type";

type PrimaryPurchaseFees = { networkFee: bigint; gasFee: bigint };

type PurchaseParams = {
  tezos: MavrykToolkit;
  review: PrimaryPurchaseReview;
  onEstimated?: (fees: PrimaryPurchaseFees) => void;
} & ContractActionLifecycleCallbacks;
type PaymentStorage = {
  ledger: ChainLedger<string, ChainNat>;
  operators: ChainLedger<{ 0: string; 1: string; 2: string }, unknown>;
};

export async function primaryPurchaseBatch({
  tezos,
  review,
}: PurchaseParams): Promise<BatchOperationKindType> {
  const { config, option, amount, quote } = review;
  const deployment = getPrimaryDeployment(tezos);
  const wallet = await tezos.wallet.pkh();
  if (
    wallet !== config.wallet ||
    config.launchpadAddress !== deployment.launchpad
  )
    throw new Error(
      "Your wallet or network changed. Review the purchase again."
    );
  const live = await readPrimaryPurchaseConfig({
    tezos,
    launchName: config.launchName,
    assetAddress: config.assetAddress,
    wallet,
  });
  if (live.unavailableReason) throw new Error(live.unavailableReason);
  const current = live.options.find(
    (item) => item.name === option.name && item.payment === option.payment
  );
  if (!current)
    throw new Error(
      "The sale option is no longer available. Review the purchase again."
    );
  validatePrimaryAmount(current, amount);
  const latestQuote = quotePrimaryPurchase(current, amount);
  if (
    current.price !== option.price ||
    current.feeBps !== option.feeBps ||
    current.discountBps !== option.discountBps ||
    current.tokenAddress !== option.tokenAddress ||
    current.tokenId !== option.tokenId ||
    live.assetTokenId !== config.assetTokenId ||
    live.distribution !== config.distribution ||
    latestQuote.totalPayment !== quote.totalPayment
  ) {
    throw new Error(
      "The purchase quote has changed. Review the updated quote and confirm again."
    );
  }
  const payment = await tezos.wallet.at(current.tokenAddress);
  const paymentStorage = await payment.storage<PaymentStorage>();
  const [balance, operator] = await Promise.all([
    paymentStorage.ledger.get(wallet),
    paymentStorage.operators.get({
      0: wallet,
      1: deployment.launchpad,
      2: current.tokenId,
    }),
  ]);
  if (BigInt(toNatString(balance ?? "0")) < BigInt(latestQuote.totalPayment))
    throw new Error("Insufficient wUSDT balance. Add funds before purchasing.");
  const launchpad = await tezos.wallet.at(deployment.launchpad);
  const batch: BatchOperationKindType = [];
  if (operator === undefined)
    batch.push({
      kind: OpKind.TRANSACTION,
      ...payment.methodsObject
        .update_operators([
          {
            add_operator: {
              owner: wallet,
              operator: deployment.launchpad,
              token_id: current.tokenId,
            },
          },
        ])
        .toTransferParams({ amount: 0 }),
    });
  batch.push({
    kind: OpKind.TRANSACTION,
    ...launchpad.methodsObject
      .purchase({
        launchName: config.launchName,
        amount,
        saleOption: current.name,
        payment: current.payment,
        maxTotalPayment: quote.totalPayment,
      })
      .toTransferParams({ amount: 0 }),
  });
  return batch;
}

function summarizePrimaryFees(
  estimates: { burnFeeMumav: number; suggestedFeeMumav: number }[]
): PrimaryPurchaseFees {
  return estimates.reduce(
    (total, estimate) => ({
      networkFee: total.networkFee + BigInt(estimate.burnFeeMumav),
      gasFee: total.gasFee + BigInt(estimate.suggestedFeeMumav),
    }),
    { networkFee: 0n, gasFee: 0n }
  );
}

export async function estimatePrimaryPurchase(params: PurchaseParams) {
  try {
    const batch = await primaryPurchaseBatch(params);
    const estimates = await params.tezos.estimate.batch(batch);
    return summarizePrimaryFees(estimates);
  } catch (error) {
    throw primaryPurchaseError(error);
  }
}

export async function primaryPurchase(params: PurchaseParams) {
  try {
    const batch = await primaryPurchaseBatch(params);
    // Estimate before the wallet prompt, surfacing token delivery/KYC failwiths.
    const estimates = await params.tezos.estimate.batch(batch);
    params.onEstimated?.(summarizePrimaryFees(estimates));
    const operation = await params.tezos.wallet.batch(batch).send();
    params.onTransactionSubmitted?.();
    const confirmation = await operation.confirmation(1);
    const level = confirmation?.block.header.level;
    if (typeof level === "number") params.onTransactionConfirmed?.({ level });
  } catch (error) {
    throw primaryPurchaseError(error);
  }
}
