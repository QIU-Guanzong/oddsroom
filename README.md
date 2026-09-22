# Oddsroom

An evidence desk that puts a Panta forecast next to **Solami Blur mainnet trade flow**, so a researcher can inspect the underlying transactions before drawing a conclusion. Token buying pressure is context, not a prediction probability or proof of an event outcome.

**Status:** implementation and automated validation complete; live credential acceptance, public deployment and the required mainnet demo remain pending. With no credentials, the app explicitly shows Preview. No Solami trades are fabricated. Wallet connection/signing and notifications are unavailable in this build.

## Run

Requires Node.js 22.18+ and npm. Use an active supported Node LTS release for hosting.

```sh
npm ci
cp .env.example .env.local
npm run dev
# http://localhost:3000
```

The account holder can populate these **server-only** environment variables in `.env.local` or the host's secret settings, then restart:

| Variable | Purpose |
| --- | --- |
| `SOLAMI_API_KEY` | Standard key with `DataApi` and RPC read permissions. Blank = Preview, no on-chain numbers. |
| `PANTA_API_KEY` | Panta market-catalog credential. Blank = labelled illustrative forecasts. |
| `PANTA_API_BASE_URL` | Defaults to `https://live-api.panta.market/api/v1`. Only that HTTPS endpoint is accepted, so a deployment typo cannot forward the catalog key elsewhere. |

Do not paste keys into a mint field, query URL, screenshot, recording, issue or submission. Never use `NEXT_PUBLIC_` for either credential. Solami upstream URLs use the documented `api_key` query parameter **only on the server**; do not enable full outbound URL logging on the host. Errors never return upstream bodies, URLs or secrets. The app sends no wallet transactions.

## Use the evidence desk

1. Select a Panta market. Its source is independent of the chain-evidence source.
2. Choose a Solana mint in **On-chain evidence**. Wrapped SOL is the default, explicitly identified as context; it is not claimed to be a Panta outcome token or settlement source.
3. Compare the market's YES probability with the buy share of the sampled token's USD trade volume. These are different measures, not calibrated forecasts.
4. Inspect buy/sell/net volume, timestamps, the latest eight trade rows and their mainnet explorer links.
5. Refresh manually or enable 30-second polling. Hidden tabs do not poll. After 90 seconds a retained snapshot is labelled stale. Failed refreshes keep the last snapshot visibly stale, with a retry action.

## What Solami does

`GET /api/chain-evidence?mint=<32-byte-base58-address>` runs a meaningful read pipeline:

- **Blur:** `https://api.solami.dev/data/token/trades?chain=solana&address=...&after_time=...&before_time=...&limit=100` requests up to 100 recent swaps within five minutes, across pools.
- Parse documented decimal strings; reject invalid amounts, identifiers, slots and times. Ignore out-of-window and future rows. Deduplicate by signature + instruction index + pool, preserving different swaps in the same transaction.
- Compute sampled buy USD, sell USD, net USD and buy share = buy USD / (buy USD + sell USD). A zero denominator is unavailable, not 0%.
- **RPC:** `getGenesisHash` checks mainnet; `getSignatureStatuses` checks up to five unique sampled signatures, requiring successful confirmed/finalized status and a matching slot. It cross-checks transaction inclusion, **not the decoded dollar amounts**. Unchecked/unknown/failed transactions never receive verified badges.
- Record request time, observation window, rejected/duplicate counts and whether the 100-row limit was reached. Display the latest eight rows; totals cover all valid rows in this bounded response.

Both upstream hosts are fixed official Solami endpoints; a browser cannot supply a URL or key. Calls time out after eight seconds and refuse redirects. A 15-second bounded process cache coalesces simultaneous requests. Client responses use `Cache-Control: no-store`. The cache is not a rate limiter: before enabling a live Solami key on Vercel, protect `/api/chain-evidence` with a Vercel WAF IP rate-limit rule and verify that the rule blocks excess requests.

### Limits and provenance

- A five-minute query is a **bounded sample**, not complete five-minute volume, 24h volume, unique wallets or liquidity. No liquidity metric is implemented or claimed.
- Blur REST history is beta and can change as Solami reindexes. Empty results do not establish zero chain activity.
- A newest trade older than 90 seconds is stale. RPC failure leaves data provider-reported with an explicit cross-check warning. A wrong genesis never passes the mainnet check.
- Invalid upstream schemas and authentication failures produce unavailable states; they never fall back to fixtures.
- Panta's market-list endpoint does not supply probability history here. Live missing prices, volumes and deadlines remain unavailable; Oddsroom generates no synthetic live chart or complementary NO price.
- The visible trade estimate is a local, non-executable calculation. There is no wallet-signing flow. Decision thresholds are session-only, without notifications.

## Verify

```sh
npm run test:solami  # Node test runner, includes Panta truthfulness regression
npm run lint
npm run build
npm start
```

Tests use deliberately synthetic, dependency-injected upstream responses. They prove parsing, aggregation, authentication placement, freshness, failure isolation, RPC checks and cache coalescing, not live service connectivity. No test fixtures ship through the production API. See [verification](docs/solami-verification.md) and [demo preparation](docs/solami-demo.md).

## Deploy

Deploy as a Next.js Node application, not a static export: both APIs must run on the server. An account holder must create or approve any new hosting account and enter credentials. A blank-key deployment is a public Preview only; it is not proof of a live hackathon submission. Public hosting has not yet been provisioned for this repository.

### Vercel Preview and post-deploy check

1. Import the repository into Vercel and make the first Preview deployment with live data variables blank. Confirm the visible Preview state contains no chain values.
2. Before entering a live `SOLAMI_API_KEY` in any Vercel environment, create a Vercel WAF IP rate-limit rule for `/api/chain-evidence`. Test that it blocks excess requests, then add the server-only key and redeploy. Do not rely on the in-process cache for this control.
3. On the protected deployment, verify that an invalid mint returns `400`, evidence responses send `Cache-Control: no-store`, and a successful connected response is labelled Solami rather than Preview. Check one current explorer link and the RPC status in the browser; a stale, empty, or unavailable response is not live-demo evidence.
4. If a Panta credential is enabled, confirm the market source label reflects the real catalog response and that missing market fields remain unavailable. Do not represent the local trade calculation as a live executable price.

## Sources and track

Verified 2026-09-22 from the current official listing and documentation:

- [Crypto World's Fair Solami track rules](https://superteam.fun/earn/listing/build-something-live-on-solana-data/): Solami must be a meaningful live data path, the public repository must have runnable setup and own-key instructions, and the 2–3 minute video or Loom must run on Solana mainnet. A project that does not run live is not judged.
- The current submission form requires project name, description, public GitHub link, a pitch deck or Loom/video link, and a Yes/No answer on Frontier Hackathon submission. Website, X, and Colosseum links are optional. The listing is human-only; the account holder must recheck the live page and complete final submission.
- [Blur data API](https://solami.dev/docs/blur), [token trades contract](https://solami.dev/docs/api/get_data-token-trades), [canonical endpoints/auth](https://solami.dev/docs/endpoints).
- [Design rationale](docs/solami-design.md).

No submission, prize or income is claimed. Only independently verifiable received funds count as revenue.

## Project provenance

The project license, dependency status, service references, and repository-asset handoff are documented in [project provenance and third-party notices](docs/project-provenance.md). The team must recheck that disclosure before submitting any new code, recording, or profile material.

A Git-backed record of the competition-period changes, validation evidence, third-party status, and open live requirements is in the [competition work timeline](docs/competition-work-timeline.md).
