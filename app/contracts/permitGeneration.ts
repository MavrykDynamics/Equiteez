// Executable generation fingerprints from docs/fixtures/permit-deployment,
// independent of the RPC endpoint's top-level section order (scriptFingerprint).
// No catalog/address override: unknown generations fail before signing.
export const permitGeneration = {
  orderbook: "f70f9eed413e7caa18411d0f2b19299d94e8d9c3ade4a7cd0670f7e0d1daf3d4",
  quote_token:
    "4983d8c9fe0a80789de220df83c834d9ee7814fff5a2fe7e991d26ec3e6cfbcd",
  rwa_token: "83e240d3ef95db559a87c71e8d944669264758301c90d82fec493ebcc498101f",
  orderbookLambda:
    "4797fb5b8afb578c9f1b2d05c9b01e738c16b9bd3bc2f2ea3b8789650ed2a596",
  orderbookSellLambda:
    "083589246b3b2e37b5ef9453310c351d9d559d49da413a83fadd76ceb139f267",
  rwaTokenId: "0",
} as const;
