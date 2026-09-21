# Oddsroom

Oddsroom is an evidence-first decision desk powered by Panta prediction markets. It helps operators discover a market, read its probability and trade activity, set an explicit decision threshold, and prepare a wallet-signed trade without giving the app custody of keys.

## Current scope

- Responsive market desk with search and category filters
- Probability and volume readouts with explicit signal-vs-fact language
- Decision threshold rules
- YES/NO trade preview
- Server-side Panta market proxy and primary-order quote proxy
- Clearly labelled preview data when no Panta credential is configured

## Run locally

```bash
cp .env.example .env.local
# Replace PANTA_API_KEY with a test key from Panta.
npm install
npm run dev
```

Open `http://localhost:3000`.

## Custody and secrets

`PANTA_API_KEY` is read only by Next.js route handlers. Wallet signing will remain client-side. Do not commit `.env.local`, wallet keys, seed phrases, JWTs, or Panta API secrets.

## Data status

Without `PANTA_API_KEY`, Oddsroom uses visibly labelled illustrative preview values. Preview values are not market facts and cannot be submitted as evidence of live Panta integration.

Powered by Panta.
