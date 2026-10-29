import { z } from "zod";
import {
  relayAcceptedSchema,
  relayConfigSchema,
  relayIntentSchema,
  relayOperationSchema,
  relayStatusSchema,
  relaySubmitSchema,
  relayTopUpSchema,
} from "./relay.schema";

export type RelayConfig = z.infer<typeof relayConfigSchema>;
export type RelayIntent = z.infer<typeof relayIntentSchema>;
export type RelaySubmitRequest = z.infer<typeof relaySubmitSchema>;
export type RelayTopUpRequest = z.infer<typeof relayTopUpSchema>;
export type RelayOperation = z.infer<typeof relayOperationSchema>;
export type RelayAccepted = z.infer<typeof relayAcceptedSchema>;
export type RelayStatus = z.infer<typeof relayStatusSchema>;
export type RelayConfigResult =
  | { state: "ready"; config: RelayConfig }
  | {
      state: "disabled";
      config: RelayConfig;
      reason: "not-found" | "unavailable" | "malformed";
    };
export type RelayConfigState = { state: "loading" } | RelayConfigResult;
// A 202 is not a complete GET row, and must never masquerade as one.
export type RelayOperationSeed = RelayAccepted & { intent: RelayIntent };
export type RelayListOptions = {
  status?: (RelayStatus | "open")[];
  limit?: number;
  cursor?: string;
};
