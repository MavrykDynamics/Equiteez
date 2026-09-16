import { describe, expect, it, vi } from "vitest";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";

import { orderbookBuyBatch, orderbookSellBatch } from "./orderbook.contract";

const createTransfer = (to: string) => ({
  amount: 0,
  to,
});

const createMockTezos = (): MavrykToolkit => {
  const contract = {
    methodsObject: {
      update_operators: vi.fn(() => ({
        toTransferParams: () => createTransfer("KT1operator"),
      })),
      placeBuyOrder: vi.fn(() => ({
        toTransferParams: () => createTransfer("KT1buy"),
      })),
      placeSellOrder: vi.fn(() => ({
        toTransferParams: () => createTransfer("KT1sell"),
      })),
    },
  };

  return {
    wallet: {
      at: vi.fn().mockResolvedValue(contract),
      pkh: vi.fn().mockResolvedValue("tz1sender"),
    },
  } as unknown as MavrykToolkit;
};

const baseBuyParams = {
  orderbookContractAddress: "KT1orderbook",
  quoteTokenAddress: "KT1quote",
  quoteTokenId: "0",
  rwaTokenAmount: "1000000",
  pricePerRwaToken: "100001",
  currency: "USDT",
  orderExpiry: null,
  baseTokenDecimals: 6,
  tickSizeAtoms: "100000",
  minRwaTokenAmount: "1",
  minQuoteValue: "1",
};

const baseSellParams = {
  orderbookContractAddress: "KT1orderbook",
  rwaTokenAddress: "KT1rwa",
  rwaTokenId: "0",
  rwaTokenAmount: "1000000",
  pricePerRwaToken: "100001",
  currency: "USDT",
  orderExpiry: null,
  baseTokenDecimals: 6,
  tickSizeAtoms: "100000",
  minRwaTokenAmount: "1",
  minQuoteValue: "1",
};

describe("orderbook contract tick validation", () => {
  it("rejects a non-tick limit buy price", async () => {
    await expect(
      orderbookBuyBatch({
        ...baseBuyParams,
        isMarketOrder: false,
        tezos: createMockTezos(),
      })
    ).rejects.toThrow("Price is not aligned to the orderbook tick size");
  });

  it("rejects a non-tick limit sell price", async () => {
    await expect(
      orderbookSellBatch({
        ...baseSellParams,
        isMarketOrder: false,
        tezos: createMockTezos(),
      })
    ).rejects.toThrow("Price is not aligned to the orderbook tick size");
  });

  it("allows a non-tick market buy reference price", async () => {
    await expect(
      orderbookBuyBatch({
        ...baseBuyParams,
        isMarketOrder: true,
        tezos: createMockTezos(),
      })
    ).resolves.toHaveLength(3);
  });

  it("allows a non-tick market sell reference price", async () => {
    await expect(
      orderbookSellBatch({
        ...baseSellParams,
        isMarketOrder: true,
        tezos: createMockTezos(),
      })
    ).resolves.toHaveLength(3);
  });
});

// Verified MARS1/USDT identities from the catalog and selected GraphQL book.
describe("selected-config transaction arguments", () => {
  it.each([false, true])(
    "preserves buy/sell entrypoint payloads (market=%s)",
    async (isMarketOrder) => {
      const tezos = createMockTezos();
      const contract = await tezos.wallet.at(
        "KT1Xku8NHSXradgodirQXxHLoVn4oESFPjes"
      );
      const payload = {
        rwaTokenAmount: "1000000",
        pricePerRwaToken: "100000",
        currency: "USDT",
        orderExpiry: null,
        isMarketOrder,
      };
      await orderbookBuyBatch({
        ...baseBuyParams,
        ...payload,
        tezos,
        orderbookContractAddress: "KT1Xku8NHSXradgodirQXxHLoVn4oESFPjes",
        quoteTokenAddress: "KT1VAymHKvx9oreDRqN22rf2huuYiV5ofe34",
      });
      expect(contract.methodsObject.placeBuyOrder).toHaveBeenCalledWith([
        payload,
      ]);
      expect(contract.methodsObject.update_operators).toHaveBeenCalledWith([
        {
          add_operator: {
            owner: "tz1sender",
            operator: "KT1Xku8NHSXradgodirQXxHLoVn4oESFPjes",
            token_id: "0",
          },
        },
      ]);
      await orderbookSellBatch({
        ...baseSellParams,
        ...payload,
        tezos,
        orderbookContractAddress: "KT1Xku8NHSXradgodirQXxHLoVn4oESFPjes",
        rwaTokenAddress: "KT1XLUiaPpivxi2e4U1wEctQ7DKDkdz9GQgK",
      });
      expect(contract.methodsObject.placeSellOrder).toHaveBeenCalledWith([
        payload,
      ]);
      expect(contract.methodsObject.update_operators).toHaveBeenCalledWith([
        {
          remove_operator: {
            owner: "tz1sender",
            operator: "KT1Xku8NHSXradgodirQXxHLoVn4oESFPjes",
            token_id: "0",
          },
        },
      ]);
    }
  );
});
