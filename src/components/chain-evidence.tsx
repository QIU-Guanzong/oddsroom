"use client";

import { useEffect, useState } from "react";
import { validMint, WRAPPED_SOL, type ChainEvidence as Evidence } from "@/lib/solami";
import styles from "./chain-evidence.module.css";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
const time = (n: number) => new Date(n * 1000).toISOString().slice(11,19);
export function ChainEvidence({ marketId, probability, marketSource }: { marketId: string; probability: number | null; marketSource: string }) {
  const [draft, setDraft] = useState(WRAPPED_SOL);
  const [mint, setMint] = useState(WRAPPED_SOL);
  const [refresh, setRefresh] = useState(0);
  const [poll, setPoll] = useState(false);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const [clock, setClock] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/chain-evidence?mint=${encodeURIComponent(mint)}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || "Evidence could not be loaded. Retry shortly.");
        return body as Evidence;
      }).then(body => { if (!controller.signal.aborted) { setEvidence(body); setClock(Date.now()); } })
      .catch(err => { if (err.name !== "AbortError") setError("Evidence could not be loaded. Retry shortly."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [mint, refresh]);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!poll) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") { setLoading(true); setError(""); setRefresh(n => n + 1); }
    }, 30_000);
    return () => clearInterval(timer);
  }, [poll]);
  const current = evidence?.mint === mint ? evidence : null;
  const expired = current?.source === "solami" ? clock - Date.parse(current.fetchedAt) > 90_000 : false;
  const outdated = current?.source === "solami" && (expired || !!error || current.status === "stale");
  const label = loading ? "Loading" : error ? "Unavailable" : outdated ? "Stale snapshot" : current?.status === "ready" ? "Recent sample" : current?.status === "empty" ? "No sample" : "Preview";
  function reload() { setLoading(true); setError(""); setRefresh(n => n + 1); }
  return <section className={styles.panel} aria-labelledby="chain-heading">
    <header className={styles.header}><div><span className={styles.kicker}>Solami / On-chain evidence</span><h3 id="chain-heading">Compare the forecast with the tape.</h3></div><span className={styles.status} role="status">{label}</span></header>
    <p className={styles.description}>Choose a Solana token as context for this forecast. Token demand does not determine the event outcome.</p>
    <form className={styles.form} onSubmit={event => {
      event.preventDefault();
      const value = draft.trim();
      if (!validMint(value)) { setInputError("Enter a valid 32-byte Solana mint address."); return; }
      setInputError(""); setMint(value); reload();
    }}>
      <label htmlFor="evidence-mint">Token mint <span>{mint === WRAPPED_SOL ? "Wrapped SOL · default context" : "User-selected context"}</span></label>
      <div><input id="evidence-mint" value={draft} onChange={e => setDraft(e.target.value)} spellCheck={false} autoComplete="off" aria-invalid={!!inputError} aria-describedby={inputError ? "mint-error" : undefined} /><button type="submit" disabled={loading}>Compare</button></div>
      {inputError && <p id="mint-error" role="alert">{inputError}</p>}
    </form>
    <div className={styles.comparison}>
      <div><span>{marketSource === "panta" ? "Panta · loaded quote" : "Panta · illustrative preview"}</span><strong>{probability === null ? "—" : `${probability}%`}</strong><small>YES implied probability</small></div>
      <div><span>Solami Blur · last 5 min sample</span><strong>{current?.summary?.buyShare != null ? `${current.summary.buyShare.toFixed(1)}%` : "—"}</strong><small>Buy share of sampled USD volume{outdated ? " · stale" : ""}</small></div>
    </div>
    <p className={styles.message} role={error ? "alert" : undefined}>{error || current?.message || "Requesting recent on-chain evidence…"}</p>
    {current?.summary && <>
      <dl className={styles.metrics}>
        <div><dt>Buy volume</dt><dd>{usd(current.summary.buyUsd)}</dd></div>
        <div><dt>Sell volume</dt><dd>{usd(current.summary.sellUsd)}</dd></div>
        <div><dt>Net buy volume</dt><dd>{usd(current.summary.netUsd)}</dd></div>
        <div><dt>Sampled swaps</dt><dd>{current.summary.count}{current.quality.capped ? " · capped" : ""}</dd></div>
      </dl>
      <div className={styles.tableWrap}><table><caption>Latest sampled trades · UTC · mainnet explorer links</caption><thead><tr><th>Time / venue</th><th>Side</th><th>USD</th><th>Transaction</th></tr></thead><tbody>{current.trades.slice(0, 8).map(t => <tr key={`${t.signature}:${t.ixIndex}:${t.pool}`}><td>{time(t.blockTime)}<small>{t.dex}</small></td><td>{t.side}</td><td>{usd(t.volumeUsd)}</td><td><a target="_blank" rel="noreferrer" href={`https://explorer.solana.com/tx/${t.signature}`}>{t.signature.slice(0, 6)}… ↗</a><small>{t.confirmation}</small></td></tr>)}</tbody></table></div>
    </>}
    {current && current.source === "solami" && <div className={styles.provenance}>
      <p>{current.rpc.message}</p>
      <p>Window {time(current.windowStart)}–{time(current.windowEnd)} UTC · fetched {new Date(current.fetchedAt).toISOString().slice(11,19)} UTC{expired ? " · refresh required" : ""}</p>
      <p>Up to 100 recent swaps. {current.quality.rejected} rejected rows, {current.quality.duplicates} duplicates removed.{current.quality.capped ? " Sample limit reached; this is not full-window volume." : ""} Buy share = buys ÷ (buys + sells), using sampled USD volume.</p>
    </div>}
    <footer className={styles.footer}>
      <button type="button" onClick={reload} disabled={loading}>{loading ? "Checking…" : "Refresh evidence"}</button>
      <label><input type="checkbox" checked={poll} onChange={e => setPoll(e.target.checked)} />Refresh every 30s</label>
      <a href="https://solami.dev/docs/blur" target="_blank" rel="noreferrer">Source & methods ↗</a>
    </footer>
    <small className={styles.note}>Forecast {marketId} · independent token context, not Panta trade settlement data. {marketSource !== "panta" && "The forecast is Preview even when Solami is connected."}</small>
  </section>;
}
