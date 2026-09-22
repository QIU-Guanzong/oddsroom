import { test } from "node:test";
import assert from "node:assert/strict";
import { validMint, WRAPPED_SOL, MAINNET_GENESIS, normalizeTrades, summarize } from "../src/lib/solami.ts";
import { loadEvidence, createEvidenceReader } from "../src/lib/solami-server.ts";

const now = 1790000000;
const row = (overrides = {}) => ({ signature: "2".repeat(88), slot: 123, block_time: now - 10, tx_index: 2, ix_index: 0, dex: "pumpswap", pool: WRAPPED_SOL, side: "buy", volume_usd: "125.50", price_usd: "150.25", ...overrides });
function upstream(trades: unknown = [row()], genesis = MAINNET_GENESIS, status: unknown = { slot: 123, err: null, confirmationStatus: "confirmed" }) {
  const calls: { url: URL; init?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: new URL(String(url)), init });
    if (!init?.body) return Response.json(trades);
    const body = JSON.parse(String(init.body));
    return Response.json({ jsonrpc: "2.0", id: 1, result: body.method === "getGenesisHash" ? genesis : { value: [status] } });
  };
  return { fetcher, calls };
}
test("mint validates decoded byte length, not just base58 characters", () => {
  assert.ok(validMint(WRAPPED_SOL)); assert.ok(validMint("1".repeat(32)));
  for (const value of ["https://evil.test", "2".repeat(32), "0".repeat(44), "1".repeat(44), "x".repeat(1000)]) assert.equal(validMint(value), false);
});
test("decimal strings, zero denominator and instruction-level deduplication", () => {
  const { trades, quality } = normalizeTrades([row(), row(), row({ ix_index: 1, side: "sell", volume_usd: "74.50" })], now);
  assert.equal(quality.duplicates, 1); assert.equal(trades.length, 2);
  assert.deepEqual(summarize(trades), { buyUsd:125.5, sellUsd:74.5, buyShare:62.74999999999999, netUsd:51, count:2 });
  assert.equal(summarize(normalizeTrades([row({volume_usd:"0"})],now).trades)?.buyShare, null);
});
test("invalid, stale-window, future and missing fields are excluded, not zero-filled", () => {
  const payload = [null, row({volume_usd:null}), row({volume_usd:"NaN"}), row({volume_usd:"1e4"}), row({volume_usd:20}), row({block_time:now-301}), row({block_time:now+30}), row({side:"unknown"}), row({ix_index:undefined}), row({pool:"bad"})];
  const result = normalizeTrades(payload, now);
  assert.equal(result.trades.length, 0); assert.equal(result.quality.rejected, 10);
  assert.throws(() => normalizeTrades({ items: [row()] }, now));
});
test("missing key is Preview and performs no network request", async () => {
  const result = await loadEvidence(WRAPPED_SOL, undefined, async () => { throw new Error("must not fetch"); }, now);
  assert.equal(result.source,"preview"); assert.equal(result.summary,null); assert.deepEqual(result.trades,[]);
});
test("Blur performs real work and RPC checks mainnet genesis, signatures, slots", async () => {
  const {fetcher, calls} = upstream();
  const result = await loadEvidence(WRAPPED_SOL,"private-test-key",fetcher,now);
  assert.equal(result.status,"ready"); assert.equal(result.rpc.mainnet,true); assert.equal(result.rpc.verified,1);
  assert.equal(result.trades[0].confirmation,"confirmed");
  assert.equal(calls[0].url.origin,"https://api.solami.dev");
  assert.equal(calls[0].url.searchParams.get("after_time"),String(now-300));
  assert.equal(calls[0].url.searchParams.get("limit"),"100");
  assert.ok(calls.every(c=>c.init?.cache==="no-store" && c.init?.redirect==="error"));
  assert.ok(!JSON.stringify(result).includes("private-test-key"));
});
test("failed, unknown or mismatched transactions never receive confirmed labels", async () => {
  for (const status of [null, {slot:123,err:{failure:true},confirmationStatus:"confirmed"}, {slot:124,err:null,confirmationStatus:"finalized"}, {slot:123,err:null,confirmationStatus:"processed"}]) {
    const result = await loadEvidence(WRAPPED_SOL,"key",upstream([row()],MAINNET_GENESIS,status).fetcher,now);
    assert.equal(result.rpc.verified,0); assert.equal(result.trades[0].confirmation,"unverified");
  }
  const wrong = await loadEvidence(WRAPPED_SOL,"key",upstream([row()],"devnet").fetcher,now);
  assert.equal(wrong.rpc.mainnet,false); assert.equal(wrong.rpc.verified,0);
});
test("empty, stale and entirely invalid samples are distinct", async () => {
  for (const [rows, status] of [[[],"empty"],[[row({block_time:now-100})],"stale"],[[row({volume_usd:null})],"unavailable"]] as const) {
    assert.equal((await loadEvidence(WRAPPED_SOL,"key",upstream(rows).fetcher,now)).status,status);
  }
});
test("upstream failures sanitize secrets and never silently use fixtures", async () => {
  for (const fetcher of [async()=>new Response("secret-key",{status:401}),async()=>{throw new Error("https://api.solami.dev?api_key=secret-key");}, async()=>Response.json({error:"secret-key"})]) {
    const result = await loadEvidence(WRAPPED_SOL,"secret-key",fetcher,now);
    assert.equal(result.status,"unavailable"); assert.equal(result.summary,null); assert.ok(!JSON.stringify(result).includes("secret-key"));
  }
});
test("sample cap is visible and RPC failure preserves only provider-reported evidence", async () => {
  const data = Array.from({length:100},(_,ix_index)=>row({ix_index}));
  const fetcher: typeof fetch = async (_url,init)=>{if(init?.body) throw new Error("rpc offline");return Response.json(data);};
  const result = await loadEvidence(WRAPPED_SOL,"key",fetcher,now);
  assert.equal(result.quality.capped,true); assert.equal(result.trades.length,100); assert.equal(result.rpc.verified,0);
});
test("concurrent polls share one server request and credential changes do not reuse cache", async () => {
  let calls=0;
  const read = createEvidenceReader(async (mint)=> { calls++;return loadEvidence(mint,undefined,undefined,now); });
  await Promise.all([read(WRAPPED_SOL,"one"),read(WRAPPED_SOL,"one")]); assert.equal(calls,1);
  await read(WRAPPED_SOL,"two"); assert.equal(calls,2);
});

import { normalizePantaMarket } from "../src/lib/panta-normalize.ts";
test("live Panta missing data stays unavailable; no artificial odds, dates or history", () => {
  const value = normalizePantaMarket({marketId:"real-1"})!;
  assert.equal(value.yesPrice,null); assert.equal(value.noPrice,null); assert.equal(value.volumeUsdc,null);
  assert.equal(value.endTime,null); assert.equal(value.change24h,null); assert.equal(value.phase,"unknown"); assert.deepEqual(value.sparkline,[]);
  const quoted = normalizePantaMarket({marketId:"real-2",yesPrice:"0.7",noPrice:"NaN",volumeUsdc:"0"})!;
  assert.equal(quoted.yesPrice,"0.7"); assert.equal(quoted.noPrice,null); assert.equal(quoted.volumeUsdc,"0");
  for (const yesPrice of ["",false,"2",-1,"Infinity"]) assert.equal(normalizePantaMarket({marketId:"m",yesPrice})?.yesPrice,null);
  assert.equal(normalizePantaMarket(null),null);
});

import { pantaMarketsUrl } from "../src/lib/panta-endpoint.ts";
test("Panta catalog credentials stay pinned to the canonical endpoint", () => {
  const requested = "http://localhost/api/markets?category=Crypto&status=primary&cursor=next&limit=20";
  const url = pantaMarketsUrl(requested, "https://live-api.panta.market/api/v1");
  assert.equal(url?.href, "https://live-api.panta.market/api/v1/markets/?category=Crypto&status=primary&cursor=next&limit=20");
  assert.equal(pantaMarketsUrl(requested, "https://attacker.example/api/v1"), null);
  assert.equal(pantaMarketsUrl(requested, "http://live-api.panta.market/api/v1"), null);
  assert.equal(pantaMarketsUrl(requested, "https://live-api.panta.market/api/v1?redirect=https://attacker.example"), null);
  assert.equal(pantaMarketsUrl("http://localhost/api/markets?limit=500", "https://live-api.panta.market/api/v1")?.searchParams.get("limit"), "30");
});

import { GET as health } from "../src/app/api/health/route.ts";
test("health is cache-safe and does not reveal deployment configuration", async () => {
  const response = health();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json() as { status: string; service: string; checkedAt: string };
  assert.equal(body.status, "ok");
  assert.equal(body.service, "oddsroom");
  assert.ok(Number.isFinite(Date.parse(body.checkedAt)));
  assert.deepEqual(Object.keys(body).sort(), ["checkedAt", "service", "status"]);
});
