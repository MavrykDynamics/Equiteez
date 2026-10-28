import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchPaymentPreference,
  fetchWalletProfile,
  PaymentPreferenceError,
  savePaymentPreference,
} from "./paymentPreference";

const mocks = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock("~/lib/apis/rwa/client", () => ({ rwaApi: mocks }));
const wallet = "mv1SSjCEsX5DCSha29oTqj4qvqWZTodRErgN";
const defaultPreference = {
  payment_method: "gasless",
  source: "default",
  version: 0,
  updated_at: null,
};
const httpError = (status: number | undefined, data?: unknown) => {
  const headers = new AxiosHeaders();
  return new AxiosError(
    "failed",
    status ? undefined : "ECONNABORTED",
    { headers },
    undefined,
    status
      ? { status, statusText: "", data, headers, config: { headers } }
      : undefined
  );
};

beforeEach(() => {
  mocks.get.mockReset();
  mocks.put.mockReset();
});
describe("payment preference api", () => {
  it("maps the default gasless preference to Credits", async () => {
    mocks.get.mockResolvedValue({ data: defaultPreference });
    await expect(fetchPaymentPreference(wallet)).resolves.toEqual({
      method: "credits",
      source: "default",
      version: 0,
      updatedAt: null,
    });
    expect(mocks.get).toHaveBeenCalledWith(
      `/wallets/${wallet}/payment-preference`,
      expect.objectContaining({ timeout: 15_000 })
    );
  });
  it("reads the profile", async () => {
    mocks.get.mockResolvedValue({
      data: { wallet_address: wallet, payment_preference: defaultPreference },
    });
    await expect(fetchWalletProfile(wallet)).resolves.toEqual({
      walletAddress: wallet,
      paymentPreference: expect.objectContaining({ method: "credits" }),
    });
  });
  it("saves with expected_version and api method names", async () => {
    mocks.put.mockResolvedValue({
      data: {
        payment_method: "mvrk",
        source: "saved",
        version: 1,
        updated_at: "2026-10-26T10:00:00Z",
      },
    });
    const saved = await savePaymentPreference(wallet, {
      method: "mvrk",
      expectedVersion: 0,
    });
    expect(saved).toMatchObject({ method: "mvrk", version: 1 });
    expect(mocks.put).toHaveBeenCalledWith(
      `/wallets/${wallet}/payment-preference`,
      { payment_method: "mvrk", expected_version: 0 },
      expect.anything()
    );
  });
  it("rejects malformed preferences instead of defaulting", async () => {
    mocks.get.mockResolvedValue({
      data: { ...defaultPreference, payment_method: "mav" },
    });
    await expect(fetchPaymentPreference(wallet)).rejects.toMatchObject({
      kind: "failed",
    });
  });
  it.each([
    [409, { code: "PAYMENT_PREFERENCE_CONFLICT" }, "conflict"],
    [503, undefined, "unavailable"],
    [401, undefined, "unauthorized"],
    [undefined, undefined, "unknown"],
    [500, undefined, "failed"],
  ])("classifies %s as %s", async (status, data, kind) => {
    mocks.put.mockRejectedValue(httpError(status, data));
    const error = await savePaymentPreference(wallet, {
      method: "credits",
      expectedVersion: 3,
    }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(PaymentPreferenceError);
    expect(error).toMatchObject({ kind });
  });
});
