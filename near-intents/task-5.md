Frontend code specification · Planning estimate: 2 working days. UI: Equiteez UI. Target repository: https://github.com/MavrykDynamics/Equiteez.

## Objective

Reflect minted tokens through Equiteez’s existing account, balance and activity data flows.

## Implementation scope

- Target repository: https://github.com/MavrykDynamics/Equiteez. Implement/design the Equiteez application; standalone Bridge UI delivery is tracked separately.
- Use UserProvider/userTokensBalances and existing wallet/portfolio/activity query refresh or notification invalidation. Validate destination token mapping and decimals.
- Where the existing RWA settlement/notification contract supports the route, correlate confirmed receipt using the forward transaction and verified log/recipient identity, not the 1Click funding transaction.
- If per-operation receipt correlation is unavailable, show neutral bridge-processing copy while existing balance data updates asynchronously. Do not infer a specific mint from an arbitrary balance increase or signer progress alone.
- Deduplicate arrival notifications and preserve wallet/session isolation on logout/reconnect. Do not create new mint-polling endpoints or require a recipient claim/payment.

## Acceptance criteria

- Received tokens appear in the intended Equiteez account balance and relevant existing activity views when their data sources update.
- Unrelated deposits, delayed indexers, other accounts and repeated notifications cannot falsely complete or announce this operation.
- No receiving-side signature, gas payment or fee-collection prompt is introduced. Missing settlement correlation is an explicit integration dependency, not a fabricated success.

## Dependencies and handoff

Depends on / coordinate with: EQ-FE-04, EQ-D-04.
