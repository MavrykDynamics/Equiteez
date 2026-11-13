Frontend code specification · Planning estimate: 2 working days. UI: Equiteez UI. Target repository: https://github.com/MavrykDynamics/Equiteez.

## Objective

Test the complete Equiteez integration and its coexistence with the existing deposit experience.

## Implementation scope

- Target repository: https://github.com/MavrykDynamics/Equiteez. Implement/design the Equiteez application; standalone Bridge UI delivery is tracked separately.
- Cover route/quote changes, source funding, modal dismissal/reopen, global widget progress, account changes, recovery after reload and asynchronous balance refresh.
- Test source rejection/uncertain broadcast, provider refunds, delayed sponsorship, API outages, repeated events and correct joining of forward-event identity.
- Validate desktop/mobile modal/widget layout, keyboard/focus restoration and status announcements; regression-test current direct bridge, Receive and settlement notifications.
- Pair with BE-09 for a test-environment transfer started inside Equiteez and verify the intended balance receipt. Standalone UI smoke testing remains FE-06.

## Acceptance criteria

- A payment can be started and followed entirely in Equiteez with one source funding action and no manual forward action.
- Navigation, refresh and minimize/reopen do not duplicate payments, widgets or arrival notifications.
- Both UI clients work against the same backend while keeping their own UI/session state isolated; existing Equiteez deposit flows remain functional.

## Dependencies and handoff

Depends on / coordinate with: EQ-FE-01, EQ-FE-02, EQ-FE-03, EQ-FE-04, EQ-FE-05, BE-05, EQ-D-04.
