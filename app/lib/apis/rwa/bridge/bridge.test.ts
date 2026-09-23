import { beforeEach, expect, it, vi } from "vitest";
import { fetchBridgeDeposits } from "./bridge";
import { deposit } from "~/providers/TransactionsProvider/bridgeTransactions.fixtures";
const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("~/lib/apis/rwa/client", () => ({ rwaApi: mocks }));
beforeEach(() => vi.resetAllMocks());

it("uses the wallet-bound documented endpoint, signal and no cache bypass for socket events", async () => {
  mocks.get.mockResolvedValue({ data: { deposits: [deposit()] } });
  const signal = new AbortController().signal;
  await expect(fetchBridgeDeposits("wallet-a", signal, false)).resolves.toEqual(
    [deposit()]
  );
  expect(mocks.get).toHaveBeenCalledWith("/wallets/wallet-a/bridge/deposits", {
    signal,
    timeout: 15_000,
    params: undefined,
  });
  await fetchBridgeDeposits("wallet-a", signal, true);
  expect(mocks.get).toHaveBeenLastCalledWith(
    "/wallets/wallet-a/bridge/deposits",
    { signal, timeout: 15_000, params: { fresh: 1 } }
  );
});
it("rejects malformed list responses and propagates transport failures", async () => {
  mocks.get.mockResolvedValueOnce({
    data: { deposits: [{ ...deposit(), status: "COMPLETED" }] },
  });
  await expect(
    fetchBridgeDeposits("wallet-a", new AbortController().signal, false)
  ).rejects.toThrow();
  mocks.get.mockRejectedValueOnce(new Error("503"));
  await expect(
    fetchBridgeDeposits("wallet-a", new AbortController().signal, false)
  ).rejects.toThrow("503");
});
