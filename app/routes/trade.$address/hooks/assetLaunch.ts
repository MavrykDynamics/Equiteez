import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { rwaApi } from "~/lib/apis/rwa/client";

const launchCardsSchema = z.object({
  address: z.string(),
  launches: z.array(
    z
      .object({
        name: z.string().min(1),
        status: z.enum(["active", "inactive", "paused", "closed"]),
      })
      .passthrough()
  ),
});

export function assetLaunchQueryOptions(assetAddress: string) {
  return queryOptions({
    queryKey: ["asset-launch", assetAddress],
    queryFn: async () => {
      const response = await rwaApi.get(
        `/assets/${encodeURIComponent(assetAddress)}/launch`
      );
      const cards = launchCardsSchema.parse(response.data);
      if (cards.address !== assetAddress)
        throw new Error("The launch response does not match this asset.");
      // The endpoint is active-first/newest-first.
      const card =
        cards.launches.find((item) => item.status === "active") ??
        cards.launches[0];
      if (!card)
        throw new Error("No primary sale is available for this asset.");
      return card;
    },
    retry: false,
    staleTime: 0,
    refetchInterval: 10_000,
  });
}
