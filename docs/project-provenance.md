# Project provenance and third-party notices

This note describes the source and ownership status of material in Oddsroom. It is intended to make the repository's provenance easy to review before a contest submission.

## Project code and documentation

The Oddsroom application code and project documentation in this repository are published under the [MIT License](../LICENSE). The repository contains the implementation, tests, setup instructions, and preview-only example data needed to run the project locally. It does not include account credentials, wallet keys, customer data, or copied third-party application source.

## Software dependencies

`package.json` declares the direct runtime dependencies: Next.js, React, and React DOM. TypeScript, ESLint, Tailwind CSS, and their plugins are development dependencies. Exact resolved versions are recorded in `package-lock.json`; `node_modules` is not committed.

These packages remain subject to their own licenses and notices. This project does not claim ownership of their code or trademarks.

## Data services and names

Oddsroom calls Panta's market catalog and Solami's Blur and RPC services only when an account holder supplies the appropriate server-side credential. No Panta or Solami data, credentials, SDK source, or branded media is bundled into the repository. “Panta,” “Solami,” “Solana,” and their associated marks remain the property of their respective owners.

## Repository assets

`public/oddsroom-mark.png` is a repository-local product mark. Before any final submission, the team should confirm that it is an original or otherwise authorized asset. Do not add third-party logos, screenshots, people, recordings, or market data to a submission unless the team has the required rights and permissions.

## Final submission check

Before uploading any project, video, or profile material, the team should confirm that:

1. all contest content is in English;
2. the project license and dependency status above remain accurate;
3. any newly added package, visual asset, code sample, or contributor is disclosed and authorized;
4. no API key, wallet secret, personal data, or customer data appears in the repository, demo, or submission; and
5. the project has been demonstrated against real mainnet data before it is represented as a live Solami integration.
