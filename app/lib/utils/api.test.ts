import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { api } from "./api";

const schema = z.object({ items: z.array(z.object({ address: z.string() })) });
const validData = { items: [{ address: "KT1asset" }] };
const url = "https://example.com/assets";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("API validation recovery", () => {
  it.each([false, true])(
    "logs invalid data and exposes a query error, with cached data: %s",
    async (hasCachedData) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ items: [{ address: 42 }] }))
          )
      );
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const queryKey = ["assets"];
      if (hasCachedData) client.setQueryData(queryKey, validData);
      const observer = new QueryObserver(client, {
        queryKey,
        queryFn: async () => (await api(url, undefined, schema)).data,
      });
      try {
        const result = await observer.refetch();
        expect(result.isError).toBe(true);
        expect(result.data).toEqual(hasCachedData ? validData : undefined);
        expect(log).toHaveBeenCalledWith("API Zod schema validation failed:", {
          url,
          method: "GET",
          issues: expect.arrayContaining([
            expect.objectContaining({ path: ["items", 0, "address"] }),
          ]),
        });
      } finally {
        observer.destroy();
        client.clear();
      }
    }
  );

  it("returns validated data and tolerates new fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ ...validData, added_field: true }))
        )
    );
    expect(await api(url, undefined, schema)).toEqual({
      code: 200,
      status: "ok",
      data: validData,
    });
  });
});
