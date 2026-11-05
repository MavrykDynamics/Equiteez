// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { GasPaymentProvider, useGasPayment } from "./GasPaymentProvider";

const mocks = vi.hoisted(() => ({
  wallet: "alice",
  authWallet: "alice" as string | null,
  chain: "chain",
  rpc: "rpc",
  get: vi.fn(),
  put: vi.fn(),
}));
vi.mock("~/lib/apis/rwa/config", () => ({ rwaApiUrl: "https://api.test/v1/" }));
vi.mock("~/lib/apis/rwa/client", () => ({
  rwaApi: { get: mocks.get, put: mocks.put },
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({
    authenticatedWalletAddress: mocks.authWallet,
    isAuthenticated: Boolean(mocks.authWallet),
    isAuthLoading: false,
  }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ userAddress: mocks.wallet }),
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

type Stored = { payment_method: "gasless" | "mvrk"; version: number };
let server: Record<string, Stored>;
const body = (stored: Stored) => ({
  ...stored,
  source: stored.version ? "saved" : "default",
  updated_at: stored.version ? "2026-10-26T10:00:00Z" : null,
});
const httpError = (status?: number, data?: unknown) => {
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
const walletOf = (url: string) => decodeURIComponent(url.split("/")[2]);

let payment: ReturnType<typeof useGasPayment>;
function Probe() {
  payment = useGasPayment();
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
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
async function render() {
  await act(async () => {
    root.render(tree());
  });
  await flush();
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.wallet = "alice";
  mocks.authWallet = "alice";
  mocks.chain = "chain";
  mocks.rpc = "rpc";
  server = {};
  mocks.get.mockReset().mockImplementation(async (url: string) => ({
    data: body(
      server[walletOf(url)] ?? { payment_method: "gasless", version: 0 }
    ),
  }));
  mocks.put.mockReset().mockImplementation(
    async (
      url: string,
      input: {
        payment_method: Stored["payment_method"];
        expected_version: number;
      }
    ) => {
      const wallet = walletOf(url);
      const current = server[wallet] ?? {
        payment_method: "gasless",
        version: 0,
      };
      if (current.version !== input.expected_version)
        throw httpError(409, { code: "PAYMENT_PREFERENCE_CONFLICT" });
      if (current.payment_method !== input.payment_method)
        server[wallet] = {
          payment_method: input.payment_method,
          version: current.version + 1,
        };
      return { data: body(server[wallet] ?? current) };
    }
  );
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
  it("maps the server default to Credits", async () => {
    await render();
    expect(payment.isRestored).toBe(true);
    expect(payment.method).toBe("credits");
    expect(payment.isExplicit).toBe(false);
    expect(payment.version).toBe(0);
    expect(mocks.get).toHaveBeenCalledWith(
      "/wallets/alice/payment-preference",
      expect.anything()
    );
  });
  it("renders Credits during SSR without requests", () => {
    expect(renderToString(tree())).toContain("credits");
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it("does not read the preference without a matching wallet JWT", async () => {
    mocks.authWallet = "bob";
    await render();
    expect(mocks.get).not.toHaveBeenCalled();
    expect(payment.isRestored).toBe(false);
    expect(payment.needsSignIn).toBe(true);
    expect(payment.method).toBe("credits");
  });
  it("saves with expected_version and updates the active method", async () => {
    await render();
    await act(async () => {
      expect(await payment.save("mvrk")).toBe(true);
    });
    expect(mocks.put).toHaveBeenCalledWith(
      "/wallets/alice/payment-preference",
      { payment_method: "mvrk", expected_version: 0 },
      expect.anything()
    );
    expect(payment.method).toBe("mvrk");
    expect(payment.isExplicit).toBe(true);
    expect(payment.version).toBe(1);
    expect(container.textContent).toContain("Wallet badge");
  });
  it("sends one PUT for a double click in the same render", async () => {
    await render();
    await act(async () => {
      const results = await Promise.all([
        payment.save("mvrk"),
        payment.save("mvrk"),
      ]);
      expect(results).toEqual([true, false]);
    });
    expect(mocks.put).toHaveBeenCalledTimes(1);
    expect(payment.error).toBeNull();
    expect(payment.isSaving).toBe(false);
  });
  it("isolates wallets", async () => {
    server.alice = { payment_method: "mvrk", version: 2 };
    await render();
    expect(payment.method).toBe("mvrk");
    mocks.wallet = mocks.authWallet = "bob";
    await render();
    expect(payment.method).toBe("credits");
    mocks.wallet = mocks.authWallet = "alice";
    await render();
    expect(payment.method).toBe("mvrk");
  });
  it("reloads on conflict and does not overwrite another device", async () => {
    await render();
    server.alice = { payment_method: "mvrk", version: 1 };
    await act(async () => {
      expect(await payment.save("credits")).toBe(false);
    });
    expect(mocks.put).toHaveBeenCalledTimes(1);
    expect(payment.method).toBe("mvrk");
    expect(payment.version).toBe(1);
    expect(payment.error).toContain("another device");
  });
  it("recovers a committed write after a timeout with GET", async () => {
    await render();
    mocks.put.mockImplementationOnce(async () => {
      server.alice = { payment_method: "mvrk", version: 1 };
      throw httpError();
    });
    await act(async () => {
      expect(await payment.save("mvrk")).toBe(true);
    });
    expect(mocks.put).toHaveBeenCalledTimes(1);
    expect(payment.method).toBe("mvrk");
    expect(payment.error).toBeNull();
  });
  it("reports an unconfirmed write after a timeout", async () => {
    await render();
    mocks.put.mockRejectedValueOnce(httpError());
    await act(async () => {
      expect(await payment.save("mvrk")).toBe(false);
    });
    expect(payment.method).toBe("credits");
    expect(payment.error).toContain("could not be confirmed");
  });
  it("keeps the active choice when Save is unavailable", async () => {
    server.alice = { payment_method: "mvrk", version: 1 };
    await render();
    mocks.put.mockRejectedValueOnce(httpError(503));
    await act(async () => {
      expect(await payment.save("credits")).toBe(false);
    });
    expect(payment.method).toBe("mvrk");
    expect(payment.error).toContain("temporarily unavailable");
  });
  it("does not fabricate a default when loading fails", async () => {
    mocks.get.mockRejectedValue(httpError(503));
    await render();
    expect(payment.isRestored).toBe(false);
    expect(payment.error).toContain("could not be loaded");
    expect(payment.errorAction).toBe("reload");
    await act(async () => {
      expect(await payment.save("mvrk")).toBe(false);
    });
    expect(mocks.put).not.toHaveBeenCalled();
  });
});
