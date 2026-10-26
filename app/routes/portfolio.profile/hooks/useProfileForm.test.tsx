// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProfileForm } from "./useProfileForm";

const mocks = vi.hoisted(() => ({
  payment: {
    wallet: "alice",
    method: "credits" as "credits" | "mvrk",
    version: 0 as number | null,
    isRestored: true,
    isSaving: false,
    error: null as string | null,
    errorAction: null,
    needsSignIn: false,
    save: vi.fn(async () => true),
    reload: vi.fn(),
    retryNetwork: vi.fn(),
  },
}));
vi.mock("~/providers/GasPaymentProvider/GasPaymentProvider", () => ({
  useGasPayment: () => mocks.payment,
}));

let form: ReturnType<typeof useProfileForm>;
function Probe() {
  form = useProfileForm();
  return null;
}
let root: Root;
const render = () =>
  act(async () => {
    root.render(<Probe />);
  });
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.assign(mocks.payment, {
    wallet: "alice",
    method: "credits",
    version: 0,
    isRestored: true,
  });
  mocks.payment.save.mockClear();
  root = createRoot(document.createElement("div"));
});
afterEach(async () => {
  await act(async () => root.unmount());
});
describe("profile form payment method", () => {
  it("keeps the draft separate and saves it", async () => {
    await render();
    expect(form.values.gasPaymentMethod).toBe("credits");
    expect(form.isDirty).toBe(false);
    await act(async () => form.setField("gasPaymentMethod", "mvrk"));
    expect(form.isDirty).toBe(true);
    await act(async () => form.save());
    expect(mocks.payment.save).toHaveBeenCalledWith("mvrk");
  });
  it("is not dirty before the preference is restored", async () => {
    mocks.payment.isRestored = false;
    await render();
    await act(async () => form.setField("gasPaymentMethod", "mvrk"));
    expect(form.isDirty).toBe(false);
  });
  it("replaces the draft with a new server version", async () => {
    await render();
    await act(async () => form.setField("gasPaymentMethod", "credits"));
    await act(async () => form.setField("fullName", "Alice"));
    Object.assign(mocks.payment, { method: "mvrk", version: 1 });
    await render();
    expect(form.values.gasPaymentMethod).toBe("mvrk");
    expect(form.values.fullName).toBe("Alice");
    expect(form.isDirty).toBe(false);
  });
  it("resets the whole draft for another wallet", async () => {
    await render();
    await act(async () => form.setField("fullName", "Alice"));
    Object.assign(mocks.payment, { wallet: "bob", method: "mvrk", version: 3 });
    await render();
    expect(form.values).toEqual({
      fullName: "",
      email: "",
      gasPaymentMethod: "mvrk",
    });
  });
});
