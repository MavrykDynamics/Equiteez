import { toNatString, toPositiveNatString } from "~/lib/utils/formaters";
import type {
  PrimaryPurchaseOption,
  PrimaryPurchaseQuote,
} from "./primaryPurchase.types";

const SCALE = 1_000_000n;
const BPS = 10_000n;

export function quotePrimaryPurchase(
  option: Pick<PrimaryPurchaseOption, "price" | "feeBps" | "discountBps">,
  amount: string
): PrimaryPurchaseQuote {
  const price = BigInt(toPositiveNatString(option.price, "Launch price"));
  const rawAmount = BigInt(toNatString(amount, "Purchase amount"));
  const feeBps = BigInt(toNatString(option.feeBps, "Purchase fee"));
  const discountBps = BigInt(
    toNatString(option.discountBps, "Purchase discount")
  );
  if (feeBps > BPS || discountBps > BPS)
    throw new Error("The launch fee configuration is invalid.");
  const totalPrice = (price * rawAmount + SCALE - 1n) / SCALE;
  const fullFee = (totalPrice * feeBps) / BPS;
  const fee = (totalPrice * feeBps * (BPS - discountBps)) / (BPS * BPS);
  const net = totalPrice - fullFee;
  return {
    totalPrice: String(totalPrice),
    fee: String(fee),
    net: String(net),
    totalPayment: String(net + fee),
  };
}

// Find an exact atom amount within the payment budget, including fee rounding.
export function primaryAmountForBudget(
  option: PrimaryPurchaseOption,
  budget: string
): string {
  const rawBudget = BigInt(toNatString(budget, "Purchase budget"));
  let low = 0n;
  let high = BigInt(option.maxAmount);
  if (high < 0n) return "0";
  while (low < high) {
    const middle = (low + high + 1n) / 2n;
    if (
      BigInt(quotePrimaryPurchase(option, String(middle)).totalPayment) <=
      rawBudget
    )
      low = middle;
    else high = middle - 1n;
  }
  return String(low);
}

export function validatePrimaryAmount(
  option: PrimaryPurchaseOption,
  amount: string
) {
  const raw = BigInt(toPositiveNatString(amount, "Purchase amount"));
  if (raw < BigInt(option.minAmount))
    throw new Error("Purchase amount is below the sale option minimum.");
  if (raw > BigInt(option.maxAmount))
    throw new Error(
      "Purchase amount exceeds the remaining sale or wallet limit."
    );
}
