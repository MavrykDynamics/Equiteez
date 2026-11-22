Frontend code specification · Planning estimate: 2 working days. UI: Equiteez UI. Target repository: https://github.com/MavrykDynamics/Equiteez.

## Objective

Obtain a recoverable operation from the shared backend before the Equiteez deposit modal requests payment.

## Implementation scope

- Target repository: https://github.com/MavrykDynamics/Equiteez. Implement/design the Equiteez application; standalone Bridge UI delivery is tracked separately.
- Show actual quote amounts, expected/minimum output, recipient and expiry inside the Equiteez modal; re-confirm material changes.
- Use stable idempotency and retain the operation ID plus authorized recovery data independently of modal visibility. Scope state to the current account and backend environment.
- Invalidate quotes on account, source wallet, network, token or amount changes. Handle sponsorship unavailable, busy destination, expired quote and below-minimum output.
- Keep the executable 1Click source deposit address distinct from the predetermined forwarder destination, which the backend resolves internally.

## Acceptance criteria

- Double clicks, modal reopen and retries do not create multiple payments for one confirmed operation.
- No funding prompt appears until the backend has persisted the executable operation.
- Changing/logging out of the Equiteez account cannot fund the old recipient from a stale modal.

## Dependencies and handoff

Depends on / coordinate with: EQ-FE-01, BE-03, EQ-D-02.
