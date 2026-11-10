Frontend code specification · Planning estimate: 2 working days. UI: Equiteez UI. Target repository: https://github.com/MavrykDynamics/Equiteez.

## Objective

Use Equiteez’s connected source wallet to fund 1Click while the maintainer handles forwarding.

## Implementation scope

- Target repository: https://github.com/MavrykDynamics/Equiteez. Implement/design the Equiteez application; standalone Bridge UI delivery is tracked separately.
- Add the configured native/ERC-20 funding adapters using EthereumProvider/wagmi and exact executable quote instructions. Reuse wallet selection and error handling where suitable.
- Submit the source transaction hash as a backend reconciliation hint and preserve ambiguous/replaced transaction state before the modal is dismissed.
- Handle wallet rejection, network mismatch, disconnect and late wallet responses after account/session changes. Retrying a status/hint request must not resend funds.
- Keep this funding path distinct from useUsdtBridge’s direct approve/wrapToken path. The 1Click funding hash is not the bridge’s forwarding-event transaction hash.

## Acceptance criteria

- The user signs only the source deposit funding action; no manual destination-chain wrap or gas action is requested.
- Native/ERC-20 transfers use the correct source chain, asset, amount and 1Click deposit address.
- Unknown broadcast results, modal closure or failed hash submission never automatically cause a second source transfer.

## Dependencies and handoff

Depends on / coordinate with: EQ-FE-02, BE-03, EQ-D-03.
