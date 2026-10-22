import { z } from "zod";

export type GasPaymentMethod = "credits" | "mvrk";
const preferenceSchema = z.object({
  version: z.literal(1),
  provenance: z.literal("explicit"),
  method: z.enum(["credits", "mvrk"]),
});
export const preferenceKey = (scope: string) => `gas-payment:${scope}`;
export function readPreference(
  storage: Pick<Storage, "getItem">,
  scope: string
) {
  const raw = storage.getItem(preferenceKey(scope));
  if (raw === null) return null;
  return preferenceSchema.parse(JSON.parse(raw));
}
export function writePreference(
  storage: Pick<Storage, "setItem">,
  scope: string,
  method: GasPaymentMethod
) {
  storage.setItem(
    preferenceKey(scope),
    JSON.stringify({ version: 1, provenance: "explicit", method })
  );
}
