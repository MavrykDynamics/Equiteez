import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTokens: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("~/providers/AuthProvider/helpers/storage", () => ({
  getAuthTokensFromStorage: mocks.getTokens,
}));
vi.mock("~/providers/AuthProvider/helpers/auth.service", () => ({
  AuthService: { refreshAccessToken: mocks.refresh },
}));

import { KycRegistrationError, requestKycRegistration } from "./kycApi";

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  mocks.getTokens.mockResolvedValue({ accessToken: "old-token" });
  mocks.refresh.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestKycRegistration", () => {
  it("sends only the access token", async () => {
    fetchMock.mockResolvedValue(
      reply(200, { status: "submitted", opHash: "oo1" })
    );

    await expect(requestKycRegistration()).resolves.toEqual({
      status: "submitted",
      opHash: "oo1",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/kyc", {
      method: "POST",
      headers: { Authorization: "Bearer old-token" },
    });
  });

  it("refreshes an expired token once and retries", async () => {
    mocks.refresh.mockResolvedValue("new-token");
    fetchMock
      .mockResolvedValueOnce(reply(401, { error: "unauthorized" }))
      .mockResolvedValueOnce(reply(200, { status: "already-member" }));

    await expect(requestKycRegistration()).resolves.toEqual({
      status: "already-member",
    });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/kyc", {
      method: "POST",
      headers: { Authorization: "Bearer new-token" },
    });
  });

  it("gives up when the refresh fails", async () => {
    mocks.refresh.mockRejectedValue(new Error("no refresh token"));
    fetchMock.mockResolvedValue(reply(401, { error: "unauthorized" }));

    await expect(requestKycRegistration()).rejects.toMatchObject({
      code: "unauthorized",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("maps server errors to codes", async () => {
    fetchMock.mockResolvedValue(reply(503, { error: "rpc-unavailable" }));
    await expect(requestKycRegistration()).rejects.toMatchObject({
      code: "rpc-unavailable",
    });

    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));
    const error = await requestKycRegistration().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(KycRegistrationError);
    expect(error).toMatchObject({ code: "unknown" });
  });
});
