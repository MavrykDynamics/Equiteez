Frontend code specification · Planning estimate: 2 working days. UI: Equiteez UI. Target repository: https://github.com/MavrykDynamics/Equiteez.

## Objective

Add the shared sponsored 1Click capability to Equiteez’s existing Deposit Funds experience.

## Implementation scope

- Target repository: https://github.com/MavrykDynamics/Equiteez. Implement/design the Equiteez application; standalone Bridge UI delivery is tracked separately.
- Integrate the backend-approved route catalog behind an Equiteez feature flag and typed client. Extend app/routes/\_index/components/DepositFunds/RDepositFundsModal.tsx and related form/components.
- Reuse the existing UserProvider and EthereumProvider/wagmi integrations. Default the deposit recipient to the current Equiteez Mavryk account, consistent with the existing deposit flow, and display it clearly.
- Support configured source network/token and amount validation. Preserve the existing direct bridge and Receive paths; do not assume the new route has the same fixed-chain USDT configuration.
- Define the client-specific backend access adapter without assuming Equiteez’s existing RWA auth token is automatically accepted by the new service. Reject stale session/account responses.

## Acceptance criteria

- An authenticated Equiteez user can enter a supported source amount and review the intended Mavryk recipient within Deposit Funds.
- Unsupported routes, wrong source network, invalid amount and unavailable service have usable states; existing deposit/Receive flows still work.
- No navigation to the standalone bridge application is required to use this feature.

## Dependencies and handoff

Depends on / coordinate with: BE-02, BE-03, EQ-D-02.
