# Oddsroom submission copy

## Project details

### What are you building, and who is it for?

Oddsroom is a decision desk for operators, researchers, and traders who use prediction markets as one input to real decisions. It brings Panta markets into a focused workflow: discover a market, inspect probability and activity, and define the threshold that would change a decision. The product keeps three layers visibly separate: verified facts, market-implied probability, and the user's own decision rule. This makes the market useful without presenting crowd belief as truth. A Solana evidence panel requests recent on-chain trades through Solami Blur and cross-checks sampled transaction inclusion through Solami RPC. Live credential acceptance is pending; without keys the panel shows Preview and no invented chain values.

### Why build this, and why now?

Prediction markets are becoming easier to trade, but the surrounding decision workflow is still fragmented. Users jump between market pages, dashboards, notes, and wallet prompts, then rely on memory to explain why they acted. That is especially weak when a market signal is mistaken for verified evidence. Panta provides market data for a focused decision product, while Solana data services can add timely on-chain context. Oddsroom makes the decision inspectable: the signal is labelled, the threshold is explicit, and wallet signing remains outside the current build.

### Technologies

Next.js 16, React 19, TypeScript, CSS Modules, a Panta authenticated REST adapter for market discovery, Solami Blur/RPC for decoded Solana mainnet evidence, server-side route handlers for credential isolation, a read-only local trade calculation without wallet signing, ESLint and production builds for validation, and OpenAI Codex for implementation and testing support.

### Chains

Solana

### How the product uses Solana

The current app reads Panta markets. It does not connect wallets or build/sign transactions. Solami Blur supplies bounded five-minute trade samples, while Solami RPC checks the mainnet genesis and sampled transaction slots/statuses. These adapters require account-holder credentials before live acceptance. All API credentials stay on the server.

### Team location

Hong Kong

### Important repository context

This public repository contains the hackathon product, its Panta and Solami server adapters, visible Preview/Live provenance states, and setup instructions. No API key or wallet secret is committed. Preview data is labelled and cannot be mistaken for live integration evidence.

### Work by people outside the listed team

No person outside the listed team performed meaningful project work.

### Notes for judges

The current public build is designed to fail visibly when live credentials are unavailable: it labels illustrative values as Preview and never presents them as Panta or Solami facts. A qualifying Solami demo still requires real mainnet data and a recorded 2–3 minute run. Panta test credentials must not be represented as live funded production trading. No signing is implemented.

## Demo video script (up to 3 minutes)

1. Open Oddsroom and point out the Live/Preview provenance badge.
2. Search and select a Panta market. Show probability, volume, and recent activity.
3. Set a session-only decision threshold; explain that notifications and durable rule storage are not connected.
4. Open the Solana evidence panel. Compare Panta probability with the bounded Solami trade sample, USD volume and buy/sell pressure. Follow a transaction explorer link and show RPC cross-check results.
5. Select YES and NO, enter an amount, and explain that the displayed share calculation is local and non-executable.
6. Show the explicit unavailable wallet state. Do not stage a connection or signing flow.
7. Close on the distinction between verified facts, market signals, and user decisions.

## Pitch video script (up to 2 minutes)

I'm Gavin, a backend and AI systems builder based in Hong Kong. I built Oddsroom because prediction markets are useful signals, but a probability alone is not a decision.

Today, people move between a market page, on-chain dashboards, notes, and a wallet. The reason for acting is easy to lose, and crowd belief can be presented as if it were verified fact. Oddsroom turns that fragmented process into one inspectable workflow.

The current product has a Panta market adapter. It adds Solami trade samples and transaction verification so users can compare prediction probability with token trading behavior on Solana. The user sets a session threshold; wallet signing and notifications remain unimplemented. Facts, market signals, and the user's rule stay visibly separate.

The architecture keeps API credentials on the server; this build sends no transactions. If live data is unavailable, Oddsroom says Preview with no chain values. Old or failed chain snapshots are explicitly labelled stale or unavailable.

My background is building reliable Python, FastAPI, data, and AI systems, then carrying them through to a clear user experience. Oddsroom applies that same discipline to prediction markets: evidence first, explicit rules, and user-controlled execution.
