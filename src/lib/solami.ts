/** Public, credential-free evidence types and strict Blur normalization. */
export const WRAPPED_SOL = "So11111111111111111111111111111111111111112";
export const WINDOW_SECONDS = 300;
export const TRADE_LIMIT = 100;
export const STALE_SECONDS = 90;
export const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

export type Trade = {
  signature: string; slot: number; blockTime: number; txIndex: number; ixIndex: number;
  dex: string; pool: string; side: "buy" | "sell"; volumeUsd: number; priceUsd: number | null;
  confirmation: "not-checked" | "confirmed" | "finalized" | "unverified";
};
export type ChainEvidence = {
  source: "solami" | "preview";
  status: "ready" | "stale" | "empty" | "unavailable" | "preview";
  mint: string; fetchedAt: string; windowStart: number; windowEnd: number;
  message: string; trades: Trade[];
  summary: null | { buyUsd: number; sellUsd: number; buyShare: number | null; netUsd: number; count: number };
  quality: { received: number; rejected: number; duplicates: number; capped: boolean };
  rpc: { mainnet: boolean; checked: number; verified: number; message: string };
};
const base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export function validMint(value: string): boolean {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) return false;
  let n = BigInt(0);
  for (const c of value) n = n * BigInt(58) + BigInt(base58.indexOf(c));
  let bytes = 0;
  while (n > 0) { bytes++; n >>= BigInt(8); }
  return bytes + (value.match(/^1*/)?.[0].length ?? 0) === 32;
}
function decimal(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+(\.\d+)?$/.test(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= Number.MAX_SAFE_INTEGER ? n : null;
}
const integer = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
export function normalizeTrades(payload: unknown, now: number) {
  if (!Array.isArray(payload) || payload.length > TRADE_LIMIT) throw new Error("Invalid Blur response");
  let rejected = 0, duplicates = 0;
  const seen = new Set<string>();
  const trades: Trade[] = [];
  for (const raw of payload) {
    if (!raw || typeof raw !== "object") { rejected++; continue; }
    const volume = decimal(raw.volume_usd);
    if (typeof raw.signature !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(raw.signature) ||
        !integer(raw.slot) || !integer(raw.block_time) || !integer(raw.tx_index) || !integer(raw.ix_index) ||
        raw.block_time > now || raw.block_time <= now - WINDOW_SECONDS ||
        !["buy", "sell"].includes(raw.side) || volume === null ||
        typeof raw.pool !== "string" || !validMint(raw.pool) || typeof raw.dex !== "string" ||
        !/^[a-zA-Z0-9_-]{1,40}$/.test(raw.dex)) { rejected++; continue; }
    // One transaction can contain multiple real swaps. Never dedupe by signature alone.
    const identity = `${raw.signature}:${raw.ix_index}:${raw.pool}`;
    if (seen.has(identity)) { duplicates++; continue; }
    seen.add(identity);
    trades.push({ signature: raw.signature, slot: raw.slot, blockTime: raw.block_time,
      txIndex: raw.tx_index, ixIndex: raw.ix_index, dex: raw.dex, pool: raw.pool,
      side: raw.side, volumeUsd: volume, priceUsd: decimal(raw.price_usd), confirmation: "not-checked" });
  }
  trades.sort((a,b) => b.blockTime - a.blockTime || b.txIndex - a.txIndex || b.ixIndex - a.ixIndex);
  return { trades, quality: { received: payload.length, rejected, duplicates, capped: payload.length === TRADE_LIMIT } };
}
export function summarize(trades: Trade[]) {
  if (!trades.length) return null;
  let buyUsd = 0, sellUsd = 0;
  for (const trade of trades) { if (trade.side === "buy") buyUsd += trade.volumeUsd; else sellUsd += trade.volumeUsd; }
  const total = buyUsd + sellUsd;
  return { buyUsd, sellUsd, buyShare: total > 0 ? buyUsd / total * 100 : null, netUsd: buyUsd - sellUsd, count: trades.length };
}
export function blankEvidence(mint: string, now: number, preview = false): ChainEvidence {
  return { source: preview ? "preview" : "solami", status: preview ? "preview" : "unavailable", mint,
    fetchedAt: new Date(now * 1000).toISOString(), windowStart: now - WINDOW_SECONDS, windowEnd: now,
    message: preview ? "Preview — Solami is not connected. No on-chain values are shown." : "Solami evidence is unavailable. Retry shortly.",
    trades: [], summary: null, quality: { received: 0, rejected: 0, duplicates: 0, capped: false },
    rpc: { mainnet: false, checked: 0, verified: 0, message: "RPC verification unavailable." } };
}
