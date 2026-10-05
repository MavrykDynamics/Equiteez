import type { BigNumber } from "bignumber.js";

export type ChainOption<T> = T | { Some: T } | null;
export type ChainMap<K, V> = {
  get(key: K): V | undefined;
  entries(): IterableIterator<[K, V]>;
};
export type ChainLedger<K, V> = { get(key: K): Promise<V | undefined> };
export type ChainNat = BigNumber | string;
export type PrimaryTierLimits = {
  minPurchaseAmount: ChainOption<ChainNat>;
  maxAmountPerWalletTotal: ChainOption<ChainNat>;
};
export type PrimarySaleOption = {
  totalBought: ChainNat;
  maxAmountCap: ChainOption<ChainNat>;
  allowedMembershipTiers: ChainMap<string, PrimaryTierLimits>;
  payments: ChainMap<
    string,
    {
      price: ChainNat;
      currency: { fa2?: { tokenContractAddress: string; tokenId: ChainNat } };
    }
  >;
  isPaused: boolean;
  saleStart: ChainOption<string>;
  saleEnd: ChainOption<string>;
};
export type PrimaryLaunch = {
  name: string;
  status: string;
  tokenContractAddress: string;
  tokenId: ChainNat;
  purchaseFeePercent: ChainNat;
  tokenIssuanceType: string;
  tokenDistributionType: string;
  maxAmountCap: ChainNat;
  totalBought: ChainNat;
  saleStart: string;
  saleEnd: ChainOption<string>;
  enableKyc: boolean;
  saleOptions: ChainMap<string, PrimarySaleOption>;
};
export type PrimaryPurchaseRecord = {
  purchased: ChainMap<string, ChainNat>;
  totalPurchased: ChainNat;
  totalDistributed: ChainNat;
};
export type PrimaryLaunchpadStorage = {
  membershipKycAddress: string;
  launchLedger: ChainLedger<string, PrimaryLaunch>;
  purchaseLedger: ChainLedger<{ 0: string; 1: string }, PrimaryPurchaseRecord>;
};
export type PrimaryKycStorage = {
  memberKycLedger: ChainLedger<
    string,
    { kycRegistrar: string; expireAt: string; frozen: boolean }
  >;
  blacklistLedger: ChainLedger<string, unknown>;
  memberLedger: ChainLedger<{ 0: string; 1: string }, string>;
  membershipTierDiscountLedger: ChainLedger<
    { 0: string; 1: string },
    ChainMap<string, ChainNat>
  >;
};
export type PrimaryPurchaseOption = {
  name: string;
  payment: string;
  price: string;
  feeBps: string;
  discountBps: string;
  tokenAddress: string;
  tokenId: string;
  minAmount: string;
  maxAmount: string;
};
export type PrimaryPurchaseConfig = {
  launchName: string;
  launchpadAddress: string;
  assetAddress: string;
  assetTokenId: string;
  wallet: string | null;
  saleStart: number;
  distribution: "AUTO" | "MANUAL";
  options: PrimaryPurchaseOption[];
  unavailableReason?: string;
  pendingDistribution: string;
};
export type PrimaryPurchaseQuote = {
  totalPrice: string;
  fee: string;
  net: string;
  totalPayment: string;
};
export type PrimaryPurchaseReview = {
  config: PrimaryPurchaseConfig;
  option: PrimaryPurchaseOption;
  amount: string;
  quote: PrimaryPurchaseQuote;
};
