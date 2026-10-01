import { describe, expect, it, vi } from "vitest";
import { BigNumber } from "bignumber.js";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { basenetNetRpcnode } from "~/consts/rpcNodes";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { getPrimaryDeployment } from "./primaryPurchase.config";
import { readPrimaryPurchaseConfig } from "./primaryPurchase.read";
import {
  primaryAmountForBudget,
  quotePrimaryPurchase,
  validatePrimaryAmount,
} from "./primaryPurchase.quote";
import {
  primaryPurchaseBatch,
  primaryPurchase,
} from "./primaryPurchase.contract";
import { primaryPurchaseError } from "./primaryPurchase.errors";
import type {
  PrimaryLaunch,
  PrimaryPurchaseOption,
  PrimaryPurchaseReview,
  PrimarySaleOption,
} from "./primaryPurchase.types";

const option: PrimaryPurchaseOption = {
  name: "Starter",
  payment: "USDT",
  price: "30000000",
  feeBps: "100",
  discountBps: "0",
  tokenAddress: USDT_BRIDGE.destinationToken.address,
  tokenId: "0",
  minAmount: "1",
  maxAmount: "9999999999999999999999",
};

describe("primary purchase arithmetic", () => {
  it("includes the fee in the list price and applies the documented discount", () => {
    expect(quotePrimaryPurchase(option, "1500000")).toEqual({
      totalPrice: "45000000",
      net: "44550000",
      fee: "450000",
      totalPayment: "45000000",
    });
    expect(
      quotePrimaryPurchase({ ...option, discountBps: "5000" }, "1500000")
    ).toEqual({
      totalPrice: "45000000",
      net: "44550000",
      fee: "225000",
      totalPayment: "44775000",
    });
  });
  it("rounds price up and the discounted fee down only once", () => {
    expect(
      quotePrimaryPurchase(
        { ...option, price: "100000001", feeBps: "333", discountBps: "1111" },
        "1"
      )
    ).toEqual({ totalPrice: "101", net: "98", fee: "2", totalPayment: "100" });
  });
  it("keeps values beyond the safe integer range exact", () => {
    expect(quotePrimaryPurchase(option, "9007199254740993").totalPayment).toBe(
      "270215977642229790"
    );
  });
  it("finds the largest exact amount within a discounted budget", () => {
    const discounted = { ...option, discountBps: "5000" };
    const amount = primaryAmountForBudget(discounted, "44775000");
    expect(amount).toBe("1500000");
    expect(
      BigInt(
        quotePrimaryPurchase(discounted, String(BigInt(amount) + 1n))
          .totalPayment
      )
    ).toBeGreaterThan(44775000n);
  });
  it("accepts inclusive minimum/maximum and rejects invalid amounts", () => {
    const limited = { ...option, minAmount: "10", maxAmount: "20" };
    expect(() => validatePrimaryAmount(limited, "10")).not.toThrow();
    expect(() => validatePrimaryAmount(limited, "20")).not.toThrow();
    for (const value of ["0", "9", "21", "-1", "0.1", "NaN"])
      expect(() => validatePrimaryAmount(limited, value)).toThrow();
    expect(() =>
      quotePrimaryPurchase({ ...option, discountBps: "10001" }, "1")
    ).toThrow();
  });
});

function fixture() {
  const saleOption: PrimarySaleOption = {
    totalBought: new BigNumber("20"),
    maxAmountCap: { Some: new BigNumber("100") },
    allowedMembershipTiers: new Map([
      [
        "Starter",
        {
          minPurchaseAmount: { Some: "10" },
          maxAmountPerWalletTotal: { Some: "50" },
        },
      ],
    ]),
    payments: new Map([
      [
        "USDT",
        {
          price: new BigNumber("30000000"),
          currency: {
            fa2: {
              tokenContractAddress: option.tokenAddress,
              tokenId: new BigNumber(0),
            },
          },
        },
      ],
    ]),
    isPaused: false,
    saleStart: null,
    saleEnd: { Some: "2099-01-01T00:00:00Z" },
  };
  const launch: PrimaryLaunch = {
    name: "launch-from-api",
    status: "ACTIVE",
    tokenContractAddress: "KT1asset",
    tokenId: new BigNumber(7),
    purchaseFeePercent: new BigNumber(100),
    tokenIssuanceType: "TRANSFER",
    tokenDistributionType: "AUTO",
    maxAmountCap: "100",
    totalBought: "10",
    saleStart: "2020-01-01T00:00:00Z",
    saleEnd: { Some: "2099-01-01T00:00:00Z" },
    enableKyc: true,
    saleOptions: new Map([["Starter", saleOption]]),
  };
  const rpc = { getRpcUrl: () => basenetNetRpcnode };
  const deployment = getPrimaryDeployment({ rpc } as unknown as MavrykToolkit);
  const launchStorage = {
    membershipKycAddress: deployment.membershipKyc,
    launchLedger: { get: vi.fn(async () => launch) },
    purchaseLedger: {
      get: vi.fn(async () => ({
        purchased: new Map([["Starter", "15"]]),
        totalPurchased: "15",
        totalDistributed: "15",
      })),
    },
  };
  const kycStorage = {
    memberKycLedger: {
      get: vi.fn(async () => ({
        kycRegistrar: "registrar",
        expireAt: "2099-01-01T00:00:00Z",
        frozen: false,
      })),
    },
    blacklistLedger: { get: vi.fn(async (): Promise<unknown> => undefined) },
    memberLedger: { get: vi.fn(async () => "Starter") },
    membershipTierDiscountLedger: {
      get: vi.fn(async () => new Map([["purchaseFeeDiscount", "0"]])),
    },
  };
  const paymentStorage = {
    ledger: { get: vi.fn(async () => "100000000") },
    operators: { get: vi.fn(async (): Promise<unknown> => undefined) },
  };
  const transferParams = vi.fn((params: { amount: number }) => ({
    to: "KT1target",
    ...params,
  }));
  const updateOperators = vi.fn(() => ({ toTransferParams: transferParams }));
  const purchase = vi.fn(() => ({ toTransferParams: transferParams }));
  const confirmation = vi.fn(async () => ({
    block: { header: { level: 123 } },
  }));
  const send = vi.fn(async () => ({ confirmation }));
  const batch = vi.fn(() => ({ send }));
  const tezos = {
    rpc,
    contract: {
      at: vi.fn(async (address: string) => ({
        storage: async () =>
          address === deployment.launchpad ? launchStorage : kycStorage,
      })),
    },
    wallet: {
      pkh: vi.fn(async () => "wallet"),
      batch,
      at: vi.fn(async () => ({
        storage: async () => paymentStorage,
        methodsObject: { update_operators: updateOperators, purchase },
      })),
    },
    estimate: { batch: vi.fn(async () => []) },
  } as unknown as MavrykToolkit;
  const read = () =>
    readPrimaryPurchaseConfig({
      tezos,
      launchName: launch.name,
      assetAddress: "KT1asset",
      wallet: "wallet",
    });
  const review = async (): Promise<PrimaryPurchaseReview> => {
    const config = await read();
    const selected = config.options[0];
    return {
      config,
      option: selected,
      amount: "10",
      quote: quotePrimaryPurchase(selected, "10"),
    };
  };
  return {
    tezos,
    deployment,
    launch,
    saleOption,
    launchStorage,
    kycStorage,
    paymentStorage,
    transferParams,
    updateOperators,
    purchase,
    confirmation,
    send,
    batch,
    read,
    review,
  };
}

describe("live primary launch configuration", () => {
  it("unwraps Taquito Some values, uses registrar-scoped membership and enforces per-option caps", async () => {
    const f = fixture();
    const config = await f.read();
    expect(config.options[0]).toMatchObject({
      minAmount: "10",
      maxAmount: "35",
      price: "30000000",
    });
    expect(config.assetTokenId).toBe("7");
    expect(f.kycStorage.memberLedger.get).toHaveBeenCalledWith({
      0: "registrar",
      1: "wallet",
    });
  });
  it("uses the smallest launch/option/wallet remaining cap", async () => {
    const f = fixture();
    f.launch.totalBought = "80";
    expect((await f.read()).options[0].maxAmount).toBe("20");
    f.saleOption.maxAmountCap = { Some: "25" };
    expect((await f.read()).options[0].maxAmount).toBe("5");
  });
  it.each(["frozen", "expired", "blacklisted", "missing"])(
    "rejects %s KYC",
    async (reason) => {
      const f = fixture();
      if (reason === "blacklisted")
        f.kycStorage.blacklistLedger.get.mockResolvedValue({});
      else if (reason === "missing")
        f.kycStorage.memberKycLedger.get.mockResolvedValue(undefined!);
      else
        f.kycStorage.memberKycLedger.get.mockResolvedValue({
          kycRegistrar: "registrar",
          expireAt: reason === "expired" ? "2000-01-01" : "2099-01-01",
          frozen: reason === "frozen",
        });
      expect((await f.read()).unavailableReason).toMatch(
        /Verify with Mavryk Pro/
      );
    }
  );
  it("allows unverified tier none only when launch KYC is disabled and the option admits none", async () => {
    const f = fixture();
    f.launch.enableKyc = false;
    f.kycStorage.memberKycLedger.get.mockResolvedValue(undefined!);
    f.saleOption.allowedMembershipTiers = new Map([
      ["none", { minPurchaseAmount: null, maxAmountPerWalletTotal: null }],
    ]);
    const config = await f.read();
    expect(config.unavailableReason).toBeUndefined();
    expect(config.options[0].discountBps).toBe("0");
  });
  it("fails explicitly for missing tier discounts", async () => {
    const f = fixture();
    f.kycStorage.membershipTierDiscountLedger.get.mockResolvedValue(new Map());
    await expect(f.read()).rejects.toThrow(/discount is not configured/);
  });
  it("does not infer eligibility from verified status alone", async () => {
    const f = fixture();
    f.kycStorage.memberLedger.get.mockResolvedValue("none");
    expect((await f.read()).unavailableReason).toMatch(/tier is not eligible/);
  });
  it("uses launch status and exclusive end dates", async () => {
    const f = fixture();
    f.launch.status = "CLOSED";
    expect((await f.read()).unavailableReason).toMatch(/not active/);
    f.launch.status = "ACTIVE";
    f.launch.saleEnd = { Some: "2000-01-01" };
    expect((await f.read()).unavailableReason).toMatch(/ended/);
  });
  it("excludes paused options and unsupported currencies", async () => {
    const f = fixture();
    f.saleOption.isPaused = true;
    expect((await f.read()).options).toEqual([]);
    f.saleOption.isPaused = false;
    f.saleOption.payments = new Map([
      [
        "OTHER",
        {
          price: "1",
          currency: { fa2: { tokenContractAddress: "KT1other", tokenId: "0" } },
        },
      ],
    ]);
    expect((await f.read()).options).toEqual([]);
  });
  it("sorts eligible options by live price and reports pending allocations", async () => {
    const f = fixture();
    const cheaper = {
      ...f.saleOption,
      payments: new Map([
        [
          "USDT",
          {
            price: "1",
            currency: {
              fa2: { tokenContractAddress: option.tokenAddress, tokenId: "0" },
            },
          },
        ],
      ]),
    };
    f.launch.saleOptions = new Map([
      ["Starter", f.saleOption],
      ["Cheaper", cheaper],
    ]);
    f.launch.tokenDistributionType = "MANUAL";
    f.launchStorage.purchaseLedger.get.mockResolvedValue({
      purchased: new Map(),
      totalPurchased: "15",
      totalDistributed: "5",
    });
    const config = await f.read();
    expect(config.options[0].name).toBe("Cheaper");
    expect(config.pendingDistribution).toBe("10");
  });
  it("rejects a launch for the wrong asset or network", async () => {
    const f = fixture();
    f.launch.tokenContractAddress = "KT1other";
    await expect(f.read()).rejects.toThrow(/does not match/);
    expect(() =>
      getPrimaryDeployment({
        rpc: { getRpcUrl: () => "https://mainnet.example" },
      } as unknown as MavrykToolkit)
    ).toThrow(/unavailable on this network/);
  });
});

describe("direct primary purchase batch", () => {
  it("grants the launchpad persistently and purchases with the exact cap and zero MAV", async () => {
    const f = fixture();
    const review = await f.review();
    const batch = await primaryPurchaseBatch({ tezos: f.tezos, review });
    expect(batch).toHaveLength(2);
    expect(f.updateOperators).toHaveBeenCalledOnce();
    expect(f.updateOperators).toHaveBeenCalledWith([
      {
        add_operator: {
          owner: "wallet",
          operator: f.deployment.launchpad,
          token_id: "0",
        },
      },
    ]);
    expect(f.purchase).toHaveBeenCalledWith({
      launchName: "launch-from-api",
      amount: "10",
      saleOption: "Starter",
      payment: "USDT",
      maxTotalPayment: "300",
    });
    expect(
      batch.every(
        (operation) =>
          operation.kind === "transaction" && operation.amount === 0
      )
    ).toBe(true);
  });
  it("skips an existing grant", async () => {
    const f = fixture();
    f.paymentStorage.operators.get.mockResolvedValue({});
    expect(
      await primaryPurchaseBatch({ tezos: f.tezos, review: await f.review() })
    ).toHaveLength(1);
    expect(f.updateOperators).not.toHaveBeenCalled();
  });
  it.each([
    "price",
    "discount",
    "cap",
    "balance",
    "wallet",
    "distribution",
    "paused",
  ])("rejects changed %s before a wallet prompt", async (change) => {
    const f = fixture();
    const review = await f.review();
    if (change === "price")
      f.saleOption.payments.get("USDT")!.price = "30000001";
    if (change === "discount")
      f.kycStorage.membershipTierDiscountLedger.get.mockResolvedValue(
        new Map([["purchaseFeeDiscount", "5000"]])
      );
    if (change === "cap") f.launch.totalBought = "99";
    if (change === "balance")
      f.paymentStorage.ledger.get.mockResolvedValue("299");
    if (change === "wallet")
      vi.mocked(f.tezos.wallet.pkh).mockResolvedValue("other");
    if (change === "distribution") f.launch.tokenDistributionType = "MANUAL";
    if (change === "paused") f.saleOption.isPaused = true;
    await expect(primaryPurchase({ tezos: f.tezos, review })).rejects.toThrow();
    expect(f.send).not.toHaveBeenCalled();
  });
  it("estimates then submits once and confirms one block through existing lifecycle callbacks", async () => {
    const f = fixture();
    const submitted = vi.fn();
    const confirmed = vi.fn();
    await primaryPurchase({
      tezos: f.tezos,
      review: await f.review(),
      onTransactionSubmitted: submitted,
      onTransactionConfirmed: confirmed,
    });
    expect(f.tezos.estimate.batch).toHaveBeenCalledOnce();
    expect(f.send).toHaveBeenCalledOnce();
    expect(f.confirmation).toHaveBeenCalledWith(1);
    expect(submitted).toHaveBeenCalledOnce();
    expect(confirmed).toHaveBeenCalledWith({ level: 123 });
  });
  it("decodes estimation failures without displaying raw contract codes", async () => {
    const f = fixture();
    vi.mocked(f.tezos.estimate.batch).mockRejectedValue({
      data: [{ with: { string: "ERROR_CANNOT_TRANSFER" } }],
    });
    await expect(
      primaryPurchase({ tezos: f.tezos, review: await f.review() })
    ).rejects.toThrow(/jurisdiction/);
    expect(f.send).not.toHaveBeenCalled();
    expect(
      primaryPurchaseError({
        errors: [{ with: { string: "ERROR_TREASURY_ADDRESS_NOT_FOUND" } }],
      }).message
    ).toMatch(/temporarily unavailable/);
  });
});
