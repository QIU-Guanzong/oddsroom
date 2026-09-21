"use client";

import { useEffect, useMemo, useState } from "react";
import type { Market, MarketsResponse } from "@/lib/markets";
import styles from "./market-terminal.module.css";
import { ChainEvidence } from "./chain-evidence";

type Side = "yes" | "no";

function Sparkline({ points }: { points: number[] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const path = points.map((point, index) => {
    const x = (index / Math.max(1, points.length - 1)) * 100;
    const y = 44 - ((point - min) / range) * 38;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  return (
    <svg className={styles.sparkline} viewBox="0 0 100 48" role="img" aria-label="Recent probability trend">
      <path d="M0,44 L100,44" className={styles.sparkGrid} />
      <path d={path} className={styles.sparkPath} />
    </svg>
  );
}

function formatMoney(value: string | null) {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1,
  }).format(Number(value));
}

function formatDeadline(timestamp: number | null) {
  if (timestamp === null) return "Unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(timestamp * 1000));
}

export function MarketTerminal() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [source, setSource] = useState<MarketsResponse["source"]>("preview");
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [side, setSide] = useState<Side>("yes");
  const [amount, setAmount] = useState("25");
  const [threshold, setThreshold] = useState(68);
  const [alertSaved, setAlertSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/markets")
      .then(async (response) => {
        if (!response.ok) throw new Error("Markets could not be loaded.");
        return (await response.json()) as MarketsResponse;
      })
      .then((data) => {
        if (!active) return;
        setMarkets(data.items);
        setSource(data.source);
        setSelectedId(data.items[0]?.marketId || "");
      })
      .catch(() => active && setError("Markets could not be loaded. Try again."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(markets.map((market) => market.category)))],
    [markets],
  );
  const visibleMarkets = useMemo(() => {
    const term = query.trim().toLowerCase();
    return markets.filter((market) =>
      (category === "All" || market.category === category) &&
      (!term || market.title.toLowerCase().includes(term)),
    );
  }, [category, markets, query]);

  const selected =
    visibleMarkets.find((market) => market.marketId === selectedId) ||
    visibleMarkets[0] ||
    markets.find((market) => market.marketId === selectedId) ||
    markets[0];
  const probability = selected?.yesPrice != null ? Math.round(Number(selected.yesPrice) * 100) : null;
  const amountNumber = Number(amount) || 0;
  const priceValue = selected ? (side === "yes" ? selected.yesPrice : selected.noPrice) : null;
  const sidePrice = priceValue !== null ? Number(priceValue) : null;
  const estimatedShares = sidePrice !== null && sidePrice > 0 ? amountNumber / sidePrice : null;

  if (loading) return <main className={styles.loading}>Opening the market desk…</main>;
  if (error || !selected) {
    return <main className={styles.loading}><strong>Desk unavailable</strong><span>{error || "No markets are available."}</span><button type="button" onClick={() => window.location.reload()}>Retry markets</button></main>;
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.nav} aria-label="Primary navigation">
        <a className={styles.mark} href="#top" aria-label="Oddsroom home">O</a>
        <nav>
          <a className={styles.navItemActive} href="#markets" aria-label="Markets">MK</a>
          <a className={styles.navItem} href="#rules" aria-label="Decision rules">DR</a>
          <a className={styles.navItem} href="#scenario" aria-label="Local scenario">PS</a>
        </nav>
        <a className={styles.profile} href="#settings" aria-label="Settings">GQ</a>
      </aside>

      <section className={styles.workspace} id="top">
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Oddsroom / Forecast desk</p>
            <h1>Read the signal. Keep the evidence.</h1>
          </div>
          <div className={styles.topActions}>
            <span className={source === "panta" ? styles.liveBadge : styles.previewBadge}>
              <i /> {source === "panta" ? "Panta API" : "Preview data"}
            </span>
            <button className={styles.walletButton} type="button" disabled>Wallet unavailable</button>
          </div>
        </header>

        {source === "preview" && (
          <div className={styles.previewNotice} role="status">
            Preview values are illustrative. Add a server-side Panta API key to display live market data.
          </div>
        )}

        <div className={styles.desk}>
          <aside className={styles.marketRail} id="markets">
            <div className={styles.railHeader}>
              <div><span className={styles.sectionNumber}>01</span><h2>Markets</h2></div>
              <span className={styles.count}>{visibleMarkets.length}</span>
            </div>
            <label className={styles.search}>
              <span>⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search markets" aria-label="Search markets" />
            </label>
            <div className={styles.categoryTabs} aria-label="Market categories">
              {categories.map((item) => (
                <button key={item} type="button" className={item === category ? styles.categoryActive : styles.category} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>
            <div className={styles.marketList}>
              {visibleMarkets.map((market) => {
                const yes = market.yesPrice === null ? "Unavailable" : `${Math.round(Number(market.yesPrice) * 100)}% YES`;
                return (
                  <button type="button" key={market.marketId} onClick={() => setSelectedId(market.marketId)} className={market.marketId === selected.marketId ? styles.marketActive : styles.market}>
                    <span className={styles.marketMeta}>{market.category} · {market.phase}</span>
                    <strong>{market.title}</strong>
                    <span className={styles.marketStats}><b>{yes}</b><span>{formatMoney(market.volumeUsdc)} vol.</span></span>
                  </button>
                );
              })}
              {visibleMarkets.length === 0 && <p className={styles.empty}>No markets match that search.</p>}
            </div>
          </aside>

          <section className={styles.marketDetail}>
            <div className={styles.detailHeader}>
              <div>
                <p className={styles.marketMeta}>{selected.category} / {selected.region}</p>
                <h2>{selected.title}</h2>
                <p>{selected.description}</p>
              </div>

            </div>

            <div className={styles.signalBlock}>
              <div className={styles.probability}>
                <span>Market probability</span>
                <strong>{probability ?? "—"}{probability !== null && <small>%</small>}</strong>
                {selected.change24h !== null ? <em className={selected.change24h >= 0 ? styles.up : styles.down}>{selected.change24h >= 0 ? "+" : ""}{selected.change24h.toFixed(1)} pts / 24h</em> : <em>24h change unavailable</em>}
              </div>
              <div className={styles.chartWrap}>
                {selected.sparkline.length > 1 ? <><div className={styles.chartLegend}><span>{source === "preview" ? "Illustrative trend" : "History"}</span><span>Now</span></div><Sparkline points={selected.sparkline} /></> : <p className={styles.tapeEmpty}>Probability history unavailable</p>}
              </div>
            </div>

            <div className={styles.metricsStrip}>
              <div><span>Volume</span><strong>{formatMoney(selected.volumeUsdc)}</strong></div>
              <div><span>Closes</span><strong>{formatDeadline(selected.endTime)}</strong></div>
              <div><span>Phase</span><strong>{selected.phase}</strong></div>
              <div><span>Signal</span><strong>{probability === null ? "Unavailable" : probability >= threshold ? "Above rule" : "Below rule"}</strong></div>
            </div>

            <ChainEvidence marketId={selected.marketId} probability={probability} marketSource={source} />

            <section className={styles.evidenceSection}>
              <div className={styles.sectionHeading}>
                <div><span className={styles.sectionNumber}>02</span><h3>Signal read</h3></div>
                <span>Market-derived, not a factual claim</span>
              </div>
              <div className={styles.signalRead}>
                <div className={styles.readLead}>
                  <span className={styles.readLabel}>Current read</span>
                  <p>{probability === null ? "No verified YES price is available for this market." : `The YES price indicates ${probability}%, ${probability >= threshold ? "at or above" : "below"} your ${threshold}% threshold. This is a market signal, not evidence that the event will occur.`}</p>
                </div>
                {source === "preview" ? (
                  <ol className={styles.tape} aria-label="Illustrative preview activity">
                    <li><time>14:32</time><span>Preview · YES</span><b>$420</b></li>
                    <li><time>13:48</time><span>Preview · NO</span><b>$175</b></li>
                    <li><time>11:06</time><span>Preview · YES</span><b>$260</b></li>
                  </ol>
                ) : (
                  <div className={styles.tapeEmpty}>Panta trade tape is not available in this build. Solami token trades appear separately above.</div>
                )}
              </div>
            </section>
          </section>

          <aside className={styles.actionRail}>
            <section className={styles.rulePanel} id="rules">
              <div className={styles.sectionHeading}><div><span className={styles.sectionNumber}>03</span><h3>Decision rule</h3></div></div>
              <p className={styles.ruleText}>Review when YES reaches</p>
              <div className={styles.thresholdValue}>{threshold}%</div>
              <input className={styles.range} type="range" min="50" max="90" step="1" value={threshold} onChange={(event) => { setThreshold(Number(event.target.value)); setAlertSaved(false); }} aria-label="Alert probability threshold" />
              <div className={styles.rangeLabels}><span>50%</span><span>90%</span></div>
              <p className={styles.ruleCheck}>Session threshold only. Notifications are not connected.</p>
              <button type="button" className={alertSaved ? styles.savedButton : styles.primaryButton} onClick={() => setAlertSaved(true)}>{alertSaved ? "Kept for this session" : "Keep session rule"}</button>
            </section>

            <section className={styles.tradePanel} id="scenario">
              <div className={styles.tradeTitle}><h3>Local scenario</h3><span>No signature yet</span></div>
              <div className={styles.sideToggle}>
                <button className={side === "yes" ? styles.yesActive : ""} onClick={() => setSide("yes")} type="button">YES <b>{selected.yesPrice === null ? "—" : `${Math.round(Number(selected.yesPrice) * 100)}¢`}</b></button>
                <button className={side === "no" ? styles.noActive : ""} onClick={() => setSide("no")} type="button">NO <b>{selected.noPrice === null ? "—" : `${Math.round(Number(selected.noPrice) * 100)}¢`}</b></button>
              </div>
              <label className={styles.amountField}>
                <span>Amount</span>
                <div><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label="Trade amount" /><b>USDC</b></div>
              </label>
              <dl className={styles.quoteRows}>
                <div><dt>Estimated shares</dt><dd>{estimatedShares === null ? "Unavailable" : estimatedShares.toFixed(2)}</dd></div>
                <div><dt>Average price</dt><dd>{sidePrice === null ? "Unavailable" : `${Math.round(sidePrice * 100)}¢`}</dd></div>
                <div><dt>Protocol fee</dt><dd>Not calculated</dd></div>
              </dl>
              <button className={styles.tradeButton} type="button" disabled>Wallet connection unavailable</button>
              <p className={styles.custodyNote}>Estimate only. Wallet signing is not connected in this build. Oddsroom never receives your keys.</p>
            </section>

            <a className={styles.pantaBadge} href="https://panta.market" target="_blank" rel="noreferrer"><span>Market reference</span><strong>Panta ↗</strong></a>
          </aside>
        </div>
      </section>
    </main>
  );
}
