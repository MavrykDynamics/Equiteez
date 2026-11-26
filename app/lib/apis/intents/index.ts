import {
  INTENTS_API_MODE,
  INTENTS_API_URL,
  INTENTS_ENV,
} from "~/consts/intents";
import { createIntentsHttpApi } from "./intents.http";
import { createIntentsMockApi } from "./intents.mock";
import type { IntentsApi } from "./intents.types";

export * from "./intents.types";

let api: IntentsApi | null = null;

/** Picks the mock simulator or the HTTP client from INTENTS_API_MODE. */
export function getIntentsApi(): IntentsApi {
  api ??=
    INTENTS_API_MODE === "mock"
      ? createIntentsMockApi()
      : createIntentsHttpApi(INTENTS_API_URL, INTENTS_ENV);
  return api;
}
