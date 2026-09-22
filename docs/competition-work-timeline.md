# Competition work timeline

This record makes the project-specific work on `main` easy to review. Git history records the commits below with timestamps after the Crypto World's Fair competition began on 2026-09-14. Those timestamps and author fields are reviewable source-control metadata, not independent proof of who performed the work or when it occurred. This record does not claim that framework code, package dependencies, or third-party services were created by this project during that period. Those materials are identified separately in the [project provenance and third-party notices](project-provenance.md).

## Reviewed commits

| Hong Kong time | Commit | Scope recorded in Git |
| --- | --- | --- |
| 2026-09-21 23:55:40 | [`23919fe`](https://github.com/QIU-Guanzong/oddsroom/commit/23919fe52e92f91ad89c830af363a44765650088) | Added the Solami chain-evidence server route, parsing and mainnet cross-check modules, the evidence-panel interface, a focused test suite, CI workflow, setup and demo material, and a MIT license. The change also added the Panta normalization path and an account-holder helper; it did not add any credential. |
| 2026-09-22 00:28:51 | [`8d39ae7`](https://github.com/QIU-Guanzong/oddsroom/commit/8d39ae7f7a82753a8c873a9c3807135042f87571) | Hardened the Preview path: added a health route, removed the unneeded quote route, revised market and evidence controls, updated dependency lock data, and expanded the documented validation and demonstration handoff. |
| 2026-09-22 18:13:14 | [`17d0e22`](https://github.com/QIU-Guanzong/oddsroom/commit/17d0e22aa2bc11aa7b28a3a544626e322c53ca1a) | Restricted the Panta catalog endpoint to its canonical HTTPS base, improved control semantics, and added matching test and documentation coverage. |
| 2026-09-22 19:02:46 | [`a92764af`](https://github.com/QIU-Guanzong/oddsroom/commit/a92764afee7b7294351046661c4fa0621477e98e) | Added the project provenance notice and linked it from the README and submission material so reviewers can inspect licensing, service references, assets, and final-submission checks. |

The reviewed code and provenance baseline is `a92764afee7b7294351046661c4fa0621477e98e`. Reviewers can use the commit links above and the public Git history to inspect the exact changes.

## Third-party material and disclosures

- The direct runtime dependencies declared in `package.json` are Next.js, React, and React DOM. TypeScript, ESLint, Tailwind CSS, and their plugins are development dependencies; exact resolved versions are in `package-lock.json`.
- Panta and Solami are external data services. The [project provenance notice](project-provenance.md) states that their data, credentials, SDK source, and branded media are not bundled, and that their names and associated marks remain the property of their respective owners. The application calls documented server-side paths only after an account holder supplies the required key.
- That same notice states that the repository contains no account credential, wallet secret, customer data, or copied third-party application source. It is a project disclosure, not an independent third-party audit. The repository-local product mark still needs an ownership or authorization check before any final submission.
- The current submission copy identifies the implementation and testing support used for the project. Any final submitter must review all disclosures again if contributors, dependencies, assets, recordings, or product behavior change.

See [project provenance and third-party notices](project-provenance.md) and the [submission material](colosseum-submission.md) for the complete current wording.

## Verification evidence

The dated verification record is in [Solami verification](solami-verification.md). It records that the following checks passed for the reviewed implementation:

- `npm run test:solami` — 13 synthetic upstream and regression checks covering parsing, freshness, preview behavior, endpoint pinning, error handling, and mainnet/signature-status logic;
- `npm run lint` and `npm run build`;
- local production HTTP checks for the no-key Preview response, invalid mint handling, and `Cache-Control: no-store`; and
- local browser checks at desktop and mobile widths, plus reduced-motion behavior.

These checks validate local code paths and deliberately injected test responses. They do not establish authenticated Panta or Solami connectivity, real chain data, deployment behavior, or a qualifying live demonstration.

## Open requirements before any live representation

The following conditions remain open and must not be represented as complete:

1. An account holder must configure valid server-side Solami credentials and, if real market data is used, a valid Panta credential.
2. The application must be deployed as a protected Next.js server application. A blank-key Preview deployment is not live evidence.
3. A real mainnet session must show a recent, non-empty response, matching mint, current timestamps, mainnet genesis, and successful sampled transaction checks. The [demo handoff](solami-demo.md) describes the capture criteria.
4. A 2–3 minute recording must demonstrate the live mainnet product without exposing credentials or implying that contextual token activity proves an event outcome.
5. The account holder must review current contest requirements and make any final platform submission. No deployment, real-data demo, submission, prize, or payment is claimed by this repository.
