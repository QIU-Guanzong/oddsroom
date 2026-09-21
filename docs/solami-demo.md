# Solami demo and account-holder handoff

## Before recording

Current state: **Preview only; no Solami/Panta key installed, no public deployment, no live-mainnet verification or recording.** Screenshots demonstrate UI and honest unavailable states, not live qualification.

1. Account holder opens the [track signup offer](https://solami.dev/signup?ref=st-earn-sep-26), completes account and terms steps, and creates a standard key with DataApi plus read-only RPC access. Never expose the key on video or in chat.
2. Account holder creates or approves a Vercel project and deploys a blank-key Preview first. Confirm it visibly says Preview and shows no chain values; this is a UI check, not qualifying live evidence.
3. Before adding `SOLAMI_API_KEY` to any Vercel environment, configure a Vercel WAF IP rate-limit rule for `/api/chain-evidence` and test that it blocks excess requests. Only then add the server-only Solami key, add a Panta catalog credential if real markets are needed, and redeploy.
4. On the protected deployment, check an invalid mint returns `400`, evidence responses use `Cache-Control: no-store`, and a connected response is visibly Solami rather than Preview. Confirm one current explorer link and RPC status in the browser.
5. Open Oddsroom, select a genuinely relevant forecast and deliberately choose the associated or contextual mint. Do not claim Wrapped SOL demand establishes a throughput, Fed, or Bitcoin outcome.
6. Require a recent non-empty Blur response, matching mint, current timestamps, mainnet genesis, and successful sampled transaction checks. If any requirement fails, stop and fix it; Preview, stale, empty, and unavailable states are not entry evidence.
7. Record a 2–3 minute live session. Keep the repository public and record the deployment URL, UTC capture time, and commit. API/account screens with secrets must not appear.

## 2:30 walkthrough

- 0:00–0:25: identify the user problem and select a live Panta forecast; show the independent Panta source label.
- 0:25–0:55: explain the chosen mint and its relevance. Show the Solami comparison; explain that sampled buy share and YES probability are different quantities.
- 0:55–1:30: show sample count, buy/sell/net dollars and the exact five-minute observation window. Explain the 100-row cap and historical beta caveat.
- 1:30–2:00: open one actual transaction in the mainnet explorer and show RPC sampled checks. RPC confirms inclusion and slot, not USD parsing correctness.
- 2:00–2:20: refresh, observe a changed timestamp and current rows. Briefly show retry/stale behavior if naturally available; do not fake a live outage.
- 2:20–2:30: show the public README and server-only setup. Explain that this build reads evidence; wallet signing is unavailable.

## Final submission

The [official Crypto World's Fair listing](https://superteam.fun/earn/listing/build-something-live-on-solana-data/) requires meaningful Solami work, a public runnable repository with setup and own-key instructions, and a 2–3 minute live-mainnet Loom or video. A non-live project is not judged. Prepare the required project name, description, public GitHub link, Loom/video or pitch-deck link, and the Yes/No Frontier Hackathon answer; website, X, and Colosseum links are optional. The listing is human-only, so the account holder must recheck the live page and perform final submission.

No revenue has been recorded. Awards, expected prizes, points, balances without a readable receipt and submission acknowledgements are not income.
