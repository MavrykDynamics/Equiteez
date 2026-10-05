import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { toNatString, toPositiveNatString } from "~/lib/utils/formaters";
import { getPrimaryDeployment } from "./primaryPurchase.config";
import type {
  ChainOption,
  PrimaryKycStorage,
  PrimaryLaunchpadStorage,
  PrimaryPurchaseConfig,
  PrimaryPurchaseOption,
} from "./primaryPurchase.types";

export function unwrapPrimaryOption<T>(value: ChainOption<T>): T | null {
  if (value !== null && typeof value === "object" && "Some" in value)
    return value.Some;
  return value;
}

function timestamp(value: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time))
    throw new Error("The launch has an invalid sale date.");
  return time;
}

function windowError(
  start: ChainOption<string>,
  end: ChainOption<string>,
  now: number
): string | undefined {
  const from = unwrapPrimaryOption(start);
  const until = unwrapPrimaryOption(end);
  if (from !== null && now < timestamp(from))
    return "The sale has not started yet.";
  if (until !== null && now >= timestamp(until)) return "The sale has ended.";
}

async function readBuyer(
  tezos: MavrykToolkit,
  address: string,
  wallet: string | null,
  now: number
) {
  if (!wallet) return { verified: false, tier: "none", discountBps: "0" };
  const contract = await tezos.contract.at(address);
  const storage = await contract.storage<PrimaryKycStorage>();
  const [record, blacklisted] = await Promise.all([
    storage.memberKycLedger.get(wallet),
    storage.blacklistLedger.get(wallet),
  ]);
  const verified = Boolean(
    record &&
      !record.frozen &&
      timestamp(record.expireAt) > now &&
      blacklisted === undefined
  );
  if (!verified || !record)
    return { verified: false, tier: "none", discountBps: "0" };
  const tier =
    (await storage.memberLedger.get({ 0: record.kycRegistrar, 1: wallet })) ??
    "none";
  if (tier === "none") return { verified, tier, discountBps: "0" };
  const discounts = await storage.membershipTierDiscountLedger.get({
    0: record.kycRegistrar,
    1: tier,
  });
  const discount = discounts?.get("purchaseFeeDiscount");
  if (discount === undefined)
    throw new Error(
      "Purchases are temporarily unavailable: membership discount is not configured."
    );
  const discountBps = toNatString(discount, "Membership discount");
  if (BigInt(discountBps) > 10_000n)
    throw new Error("The membership discount configuration is invalid.");
  return { verified, tier, discountBps };
}

export async function readPrimaryPurchaseConfig({
  tezos,
  launchName,
  assetAddress,
  wallet,
  now = Date.now(),
}: {
  tezos: MavrykToolkit;
  launchName: string;
  assetAddress: string;
  wallet: string | null;
  now?: number;
}): Promise<PrimaryPurchaseConfig> {
  const deployment = getPrimaryDeployment(tezos);
  const contract = await tezos.contract.at(deployment.launchpad);
  const storage = await contract.storage<PrimaryLaunchpadStorage>();
  if (storage.membershipKycAddress !== deployment.membershipKyc)
    throw new Error("The launch membership configuration has changed.");
  const launch = await storage.launchLedger.get(launchName);
  if (
    !launch ||
    launch.name !== launchName ||
    launch.tokenContractAddress !== assetAddress
  )
    throw new Error("The launch does not match the selected asset.");
  if (
    launch.tokenDistributionType !== "AUTO" &&
    launch.tokenDistributionType !== "MANUAL"
  )
    throw new Error("The launch distribution configuration is invalid.");
  if (
    launch.tokenIssuanceType !== "MINT" &&
    launch.tokenIssuanceType !== "TRANSFER"
  )
    throw new Error("The launch issuance configuration is invalid.");
  const feeBps = toNatString(launch.purchaseFeePercent, "Purchase fee");
  if (BigInt(feeBps) > 10_000n)
    throw new Error("The launch fee configuration is invalid.");
  const [buyer, record] = await Promise.all([
    readBuyer(tezos, deployment.membershipKyc, wallet, now),
    wallet
      ? storage.purchaseLedger.get({ 0: launchName, 1: wallet })
      : undefined,
  ]);
  const launchRemaining =
    BigInt(toNatString(launch.maxAmountCap)) -
    BigInt(toNatString(launch.totalBought));
  const options: PrimaryPurchaseOption[] = [];
  let hasEligibleTier = false;
  for (const [name, option] of launch.saleOptions.entries()) {
    const tier = option.allowedMembershipTiers.get(buyer.tier);
    if (!tier) continue;
    hasEligibleTier = true;
    if (option.isPaused || windowError(option.saleStart, option.saleEnd, now))
      continue;
    const caps = [launchRemaining];
    const optionCap = unwrapPrimaryOption(option.maxAmountCap);
    const walletCap = unwrapPrimaryOption(tier.maxAmountPerWalletTotal);
    if (optionCap !== null)
      caps.push(
        BigInt(toNatString(optionCap)) - BigInt(toNatString(option.totalBought))
      );
    if (walletCap !== null)
      caps.push(
        BigInt(toNatString(walletCap)) -
          BigInt(toNatString(record?.purchased.get(name) ?? "0"))
      );
    const remaining = caps.reduce((min, cap) => (cap < min ? cap : min));
    const minAmount = toNatString(
      unwrapPrimaryOption(tier.minPurchaseAmount) ?? "1"
    );
    for (const [payment, pay] of option.payments.entries()) {
      const fa2 = pay.currency.fa2;
      // This release supports the deployed wUSDT payment asset. Never reinterpret
      // another currency as wUSDT, or borrow the secondary orderbook's currency.
      if (
        !fa2 ||
        fa2.tokenContractAddress !== USDT_BRIDGE.destinationToken.address ||
        toNatString(fa2.tokenId) !== USDT_BRIDGE.destinationToken.id
      )
        continue;
      options.push({
        name,
        payment,
        price: toPositiveNatString(pay.price, "Launch price"),
        feeBps,
        discountBps: buyer.discountBps,
        tokenAddress: fa2.tokenContractAddress,
        tokenId: toNatString(fa2.tokenId),
        minAmount: BigInt(minAmount) < 1n ? "1" : minAmount,
        maxAmount: String(remaining > 0n ? remaining : 0n),
      });
    }
  }
  options.sort((a, b) =>
    BigInt(a.price) < BigInt(b.price)
      ? -1
      : BigInt(a.price) > BigInt(b.price)
        ? 1
        : a.name.localeCompare(b.name)
  );
  const unavailableReason =
    launch.status !== "ACTIVE"
      ? "The launch is not active."
      : (windowError(launch.saleStart, launch.saleEnd, now) ??
        (!wallet
          ? "Connect your wallet to purchase."
          : launch.enableKyc && !buyer.verified
            ? "Verify with Mavryk Pro before purchasing."
            : !hasEligibleTier
              ? "Your membership tier is not eligible for this sale."
              : !options.length
                ? "No open sale option with a supported payment currency is available."
                : undefined));
  const pending = record
    ? BigInt(toNatString(record.totalPurchased)) -
      BigInt(toNatString(record.totalDistributed))
    : 0n;
  return {
    launchName,
    launchpadAddress: deployment.launchpad,
    assetAddress,
    assetTokenId: toNatString(launch.tokenId),
    wallet,
    saleStart: timestamp(launch.saleStart),
    distribution: launch.tokenDistributionType,
    options,
    unavailableReason,
    pendingDistribution: String(pending > 0n ? pending : 0n),
  };
}
