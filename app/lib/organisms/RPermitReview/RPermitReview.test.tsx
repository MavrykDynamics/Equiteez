// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RPermitReview } from "./RPermitReview";
import {
  signPreparedPermit,
  type PreparedPermit,
  type PermitRuntime,
} from "~/contracts/permit";

vi.mock("~/contracts/permit", () => ({ signPreparedPermit: vi.fn() }));
vi.mock("~/templates/PopupWIthIcon/PopupWithIcon", () => ({
  PopupWithIcon: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("~/lib/atoms/RButton", () => ({
  RButton: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
vi.mock("~/lib/atoms/RTypography/RHeading", () => ({
  RHeading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));
vi.mock("~/lib/atoms/RTypography/RText", () => ({
  RText: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.clearAllMocks();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
const prepared = {
  fields: [
    { label: "Payment (raw units)", value: "90071992547409931" },
    { label: "Permission", value: "Persistent operator permission" },
  ],
  signingBlocker: null,
} as unknown as PreparedPermit;
const runtime = {} as PermitRuntime;

describe("readable permit review", () => {
  it("shows exact details and signs only after explicit acceptance", async () => {
    const onSigned = vi.fn();
    const onCancel = vi.fn();
    const result = {} as Awaited<ReturnType<typeof signPreparedPermit>>;
    vi.mocked(signPreparedPermit).mockResolvedValue(result);
    act(() =>
      root.render(
        <RPermitReview
          prepared={prepared}
          runtime={runtime}
          onSigned={onSigned}
          onCancel={onCancel}
        />
      )
    );
    expect(host.textContent).toContain("90071992547409931");
    expect(host.textContent).toContain("Persistent operator permission");
    expect(signPreparedPermit).not.toHaveBeenCalled();
    await act(async () => {
      host.querySelectorAll("button")[1].click();
    });
    expect(signPreparedPermit).toHaveBeenCalledWith(runtime, prepared);
    expect(onSigned).toHaveBeenCalledWith(result);
  });
  it("shows signing errors without reporting completion", async () => {
    const onSigned = vi.fn();
    vi.mocked(signPreparedPermit).mockRejectedValue(
      new Error("Wallet changed")
    );
    act(() =>
      root.render(
        <RPermitReview
          prepared={prepared}
          runtime={runtime}
          onSigned={onSigned}
          onCancel={vi.fn()}
        />
      )
    );
    await act(async () => {
      host.querySelectorAll("button")[1].click();
    });
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "Wallet changed"
    );
    expect(onSigned).not.toHaveBeenCalled();
    expect(host.querySelectorAll("button")[1].disabled).toBe(true);
  });
  it("keeps unsupported top-up signing disabled with its reason", () => {
    act(() =>
      root.render(
        <RPermitReview
          prepared={{
            ...prepared,
            signingBlocker: "Deadline reconstruction is unspecified",
          }}
          runtime={runtime}
          onSigned={vi.fn()}
          onCancel={vi.fn()}
        />
      )
    );
    expect(host.textContent).toContain(
      "Deadline reconstruction is unspecified"
    );
    expect(host.querySelectorAll("button")[1].disabled).toBe(true);
  });
});
