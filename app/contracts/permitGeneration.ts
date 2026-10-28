// Executable generation fingerprints from docs/fixtures/permit-deployment.
// No catalog/address override: unknown generations fail before signing.
export const permitGeneration = {
  orderbook: "f88d9928393a1750a0d48e773990d92ac37ca6dfd17d6e7a7372e7bb9da26839",
  quote_token:
    "5c1dea2778734c804bdc1db5c397e49de4c3c1ea111076ea881d74dee0c48022",
  rwa_token: "c6f54abbd2430d5e20242e0cd4db220e2ea36b2a36a09fba766ec4c4af560d9b",
  orderbookLambda:
    "4797fb5b8afb578c9f1b2d05c9b01e738c16b9bd3bc2f2ea3b8789650ed2a596",
  orderbookSellLambda:
    "083589246b3b2e37b5ef9453310c351d9d559d49da413a83fadd76ceb139f267",
  rwaTokenId: "0",
} as const;
