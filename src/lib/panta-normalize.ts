import type { Market } from "./markets.ts";
const phases = new Set(["primary", "secondary", "resolved", "cancelled"]);
function numeric(value: unknown, maximum: number): string | null {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+(\.\d+)?$/.test(value))) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= maximum ? String(number) : null;
}
export function normalizePantaMarket(value: unknown): Market | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.marketId !== "string" || !item.marketId) return null;
  return {
    marketId: item.marketId,
    category: typeof item.category === "string" ? item.category : "Other",
    title: typeof item.title === "string" ? item.title : "Untitled market",
    description: typeof item.description === "string" ? item.description : "No market description provided.",
    phase: typeof item.phase === "string" && phases.has(item.phase) ? item.phase as Market["phase"] : "unknown",
    region: typeof item.region === "string" ? item.region : "Unspecified",
    volumeUsdc: numeric(item.volumeUsdc, Number.MAX_SAFE_INTEGER),
    yesPrice: numeric(item.yesPrice ?? item.primaryYesPrice, 1),
    noPrice: numeric(item.noPrice ?? item.primaryNoPrice, 1),
    endTime: typeof item.endTime === "number" && Number.isSafeInteger(item.endTime) && item.endTime > 0 && item.endTime <= 8640000000000 ? item.endTime : null,
    // This endpoint does not supply probability history or a measured 24h change.
    change24h: null,
    sparkline: [],
  };
}
