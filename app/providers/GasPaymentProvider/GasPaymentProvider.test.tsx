// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { GasPaymentProvider, useGasPayment } from "./GasPaymentProvider";
import { useProfileForm } from "~/routes/portfolio.profile/hooks/useProfileForm";
import {
  preferenceKey,
  readPreference,
  writePreference,
} from "./paymentPreference";
const mocks = vi.hoisted(() => ({
  wallet: "alice",
  chain: "chain",
  balance: undefined as number | undefined,
  rpc: "rpc",
}));
vi.mock("~/lib/apis/rwa/config", () => ({ rwaApiUrl: "https://api.test/v1/" }));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({
    userAddress: mocks.wallet,
    userTokensBalances: { mav: mocks.balance },
  }),
}));
vi.mock("~/providers/WalletProvider/wallet.provider", () => {
  const toolkit = {
    rpc: { getRpcUrl: () => mocks.rpc, getChainId: async () => mocks.chain },
  };
  const dapp = { tezos: () => toolkit };
  return { useWalletContext: () => ({ dapp }) };
});
vi.mock(
  "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/CreditsWalletDropdown",
  () => ({ CreditsWalletDropdown: () => <span>Credits badge</span> })
);
vi.mock("~/layouts/PageLayout/WalletDropdown/MvrkWalletDropdown", () => ({
  MvrkWalletDropdown: () => <span>Wallet badge</span>,
}));
vi.mock("~/templates/CustomSuspense", () => ({
  CustomSuspense: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));
let payment: ReturnType<typeof useGasPayment>;
let form: ReturnType<typeof useProfileForm>;
function Probe() {
  payment = useGasPayment();
  form = useProfileForm();
  return (
    <>
      <span>{payment.method}</span>
      <ConnectWallet />
    </>
  );
}
let root: Root;
let container: HTMLDivElement;
let client: QueryClient;
const tree = () => (
  <QueryClientProvider client={client}>
    <GasPaymentProvider>
      <Probe />
    </GasPaymentProvider>
  </QueryClientProvider>
);
async function render() {
  await act(async () => {
    root.render(tree());
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.wallet = "alice";
  mocks.chain = "chain";
  mocks.rpc = "rpc";
  localStorage.clear();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  container = document.createElement("div");
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  vi.restoreAllMocks();
});
describe("payment preference", () => {
  it.each([undefined, 0, 999999])(
    "defaults to Credits regardless of native balance %s",
    async (balance) => {
      mocks.balance = balance;
      await render();
      expect(payment.method).toBe("credits");
      expect(payment.isExplicit).toBe(false);
    }
  );
  it("does not access storage during SSR", () => {
    const get = vi.spyOn(Storage.prototype, "getItem");
    expect(renderToString(tree())).toContain("credits");
    expect(get).not.toHaveBeenCalled();
  });
  it("keeps draft separate, saves, restores, and isolates wallet/network drafts", async () => {
    await render();
    await act(async () => form.setField("gasPaymentMethod", "mvrk"));
    expect(payment.method).toBe("credits");
    expect(container.textContent).toContain("Credits badge");
    await act(async () => form.save());
    expect(payment.method).toBe("mvrk");
    expect(payment.isExplicit).toBe(true);
    expect(container.textContent).toContain("Wallet badge");
    const aliceScope = payment.scope!;
    expect(readPreference(localStorage, aliceScope)?.method).toBe("mvrk");
    await act(async () => form.setField("gasPaymentMethod", "credits"));
    mocks.wallet = "bob";
    await render();
    expect(form.values.gasPaymentMethod).toBe("credits");
    expect(payment.isExplicit).toBe(false);
    mocks.wallet = "alice";
    await render();
    expect(payment.method).toBe("mvrk");
    mocks.rpc = "other-rpc";
    await render();
    expect(payment.method).toBe("credits");
    await act(async () => root.unmount());
    root = createRoot(document.createElement("div"));
    mocks.rpc = "rpc";
    await render();
    expect(form.values.gasPaymentMethod).toBe("mvrk");
  });
  it("keeps active choice and draft after failed Save, then retries", async () => {
    await render();
    await act(async () => payment.save("mvrk"));
    await act(async () => form.setField("gasPaymentMethod", "credits"));
    const write = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    await act(async () => form.save());
    expect(payment.method).toBe("mvrk");
    expect(form.values.gasPaymentMethod).toBe("credits");
    expect(form.saveError).toContain("could not be saved");
    write.mockRestore();
    await act(async () => form.save());
    expect(payment.method).toBe("credits");
  });
  it.each(['{"method":"mav"}', '{"version":1,"method":"mvrk"}', "broken"])(
    "rejects unproven/corrupt storage %s",
    async (raw) => {
      await render();
      localStorage.setItem(preferenceKey(payment.scope!), raw);
      await act(async () =>
        window.dispatchEvent(
          new StorageEvent("storage", { key: preferenceKey(payment.scope!) })
        )
      );
      expect(payment.method).toBe("credits");
      expect(payment.error).toContain("could not be restored");
    }
  );
  it("reports denied reads and permits explicit recovery", async () => {
    const read = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });
    await render();
    expect(payment.error).toContain("restored");
    read.mockRestore();
    await act(async () => form.save());
    expect(payment.isExplicit).toBe(true);
  });
  it("only restores explicit versioned records", () => {
    writePreference(localStorage, "scope", "mvrk");
    expect(readPreference(localStorage, "scope")).toEqual({
      version: 1,
      provenance: "explicit",
      method: "mvrk",
    });
    expect(readPreference(localStorage, "different")).toBeNull();
  });
});
