# Verification — 2026-09-21

## Completed

- `npm run test:solami`: 12 passing Node tests. Includes mint byte-length validation, decimal-string parsing, zero denominator, instruction-level deduplication, invalid/out-of-window rows, no-key/no-network Preview, fixed Solami authentication path, mainnet and signature/slot checks, wrong/failed/unknown transactions, stale/empty/unavailable distinction, error redaction, capped samples, request coalescing, and Panta missing-data validation regressions.
- `npm run lint`: passed.
- `npm run build`: passed; Next.js production build includes the chain-evidence and markets APIs.
- Production server HTTP checks: missing key returns Preview with `trades: []` and `summary: null`; invalid mint returns 400; `Cache-Control: no-store` present.
- Browser at desktop 1280px and mobile 390 × 844: no document horizontal overflow, market selection updates comparison, long forecast title wraps, mint validation gives an accessible error, keyboard Tab/Enter submits a corrected address, Refresh recovers after a simulated offline failure.
- Reduced-motion emulation: respected (computed transition duration 0.00001s due to existing global reduced-motion rule). Restored browser media and viewport after checking.
- Credential helper reviewed and checked with synthetic inputs in a temporary directory: preserves other env settings, replaces old Panta values, changes an existing 0644 env file to 0600, and suppresses upstream error bodies. No account registration, login or API-key creation performed.

## Evidence

Screenshots in `docs/screenshots/` show **Preview**, not live data. They are local browser captures of the production build. Demo recording steps are in [solami-demo.md](solami-demo.md).

## Not yet verified

No Solami or Panta credential was supplied. Actual authenticated REST/RPC connectivity, real mainnet trade rows, real transaction-explorer cross-checks, real Panta market schemas, hosted production behavior and the required 2–3 minute live-mainnet recording are **pending account-holder setup**. Unit tests use synthetic upstream responses and are not service acceptance evidence. The populated transaction table has not been accepted against real upstream data.

The local design was inspected; aesthetic approval from the user is not claimed. This build has no translations, wallet/signing, notifications, liquidity metric, 24-hour full-volume metric or trading execution. No prize submission, payout or income is recorded.
