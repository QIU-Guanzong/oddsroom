// Imported only by the Node route. Credentials never enter client props or responses.
import { blankEvidence, MAINNET_GENESIS, normalizeTrades, STALE_SECONDS, summarize, TRADE_LIMIT, type ChainEvidence } from "./solami.ts";

type Fetcher = typeof fetch;
async function json(fetcher: Fetcher, url: URL, init: RequestInit = {}) {
  const response = await fetcher(url, { ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Upstream unavailable");
  return response.json();
}
async function rpc(fetcher: Fetcher, key: string, method: string, params: unknown[] = []) {
  const url = new URL("https://rpc.solami.dev/sol");
  url.searchParams.set("api_key", key);
  const payload = await json(fetcher, url, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  if (!payload || payload.error || payload.jsonrpc !== "2.0" || payload.id !== 1 || !("result" in payload)) throw new Error("Invalid RPC response");
  return payload.result;
}
export async function loadEvidence(mint: string, key: string | undefined, fetcher: Fetcher = fetch, now = Math.floor(Date.now()/1000)): Promise<ChainEvidence> {
  const base = blankEvidence(mint, now, !key?.trim());
  if (!key?.trim()) return base;
  try {
    const url = new URL("https://api.solami.dev/data/token/trades");
    for (const [k, v] of Object.entries({ chain: "solana", address: mint, limit: String(TRADE_LIMIT), after_time: String(base.windowStart), before_time: String(now + 1), api_key: key })) url.searchParams.set(k, v);
    const { trades, quality } = normalizeTrades(await json(fetcher, url), now);
    const result: ChainEvidence = { ...base, trades, quality, summary: summarize(trades),
      status: trades.length ? (now - trades[0].blockTime > STALE_SECONDS ? "stale" : "ready") : (quality.rejected ? "unavailable" : "empty"),
      message: "Recent Blur sample, not total market volume. Historical indexing is beta." };
    if (!trades.length) result.message = quality.rejected ? "Blur returned unusable rows. No signal is available." : "No trades returned for this five-minute window. This does not prove zero activity.";
    if (result.status === "stale") result.message = "Latest sampled trade is over 90 seconds old. Treat this evidence as stale.";
    try {
      if (await rpc(fetcher, key, "getGenesisHash") !== MAINNET_GENESIS) throw new Error("Wrong network");
      result.rpc.mainnet = true;
      const signatures = [...new Set(trades.map(t => t.signature))].slice(0, 5);
      if (signatures.length) {
        const statuses = await rpc(fetcher, key, "getSignatureStatuses", [signatures, { searchTransactionHistory: true }]);
        if (!Array.isArray(statuses?.value) || statuses.value.length !== signatures.length) throw new Error("Invalid statuses");
        result.rpc.checked = signatures.length;
        for (let i = 0; i < signatures.length; i++) {
          const status = statuses.value[i];
          const rows = trades.filter(t => t.signature === signatures[i]);
          const verified = status && status.err === null && ["confirmed", "finalized"].includes(status.confirmationStatus) && rows.every(t => t.slot === status.slot);
          rows.forEach(t => { t.confirmation = verified ? status.confirmationStatus : "unverified"; });
          if (verified) result.rpc.verified++;
        }
      }
      result.rpc.message = `Mainnet genesis checked. ${result.rpc.verified}/${result.rpc.checked} sampled transactions confirmed with matching slots. RPC does not verify decoded USD amounts.`;
    } catch {
      result.rpc.message = "RPC cross-check unavailable. Blur trades are provider-reported, not independently confirmed here.";
    }
    return result;
  } catch {
    // Deliberately discard upstream body, URL and error text: any can contain the key.
    return base;
  }
}

// Short, bounded process cache: deduplicates simultaneous polls without retaining stale results.
export function createEvidenceReader(loader: typeof loadEvidence = loadEvidence) {
  const cache = new Map<string, { until: number; value: Promise<ChainEvidence> }>();
  return (mint: string, key: string | undefined) => {
    if (!key?.trim()) return loader(mint, undefined);
    const id = `${key}:${mint}`;
    const existing = cache.get(id);
    if (existing && existing.until > Date.now()) return existing.value;
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    const value = loader(mint, key);
    cache.set(id, { until: Date.now() + 15_000, value });
    return value;
  };
}
