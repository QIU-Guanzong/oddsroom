import { previewMarkets, type Market, type MarketsResponse } from "@/lib/markets";

const PANTA_BASE =
  process.env.PANTA_API_BASE_URL ?? "https://live-api.panta.market/api/v1";

type PantaMarket = {
  marketId: string;
  category?: string;
  title?: string;
  description?: string;
  phase?: Market["phase"];
  region?: string;
  volumeUsdc?: string;
  yesPrice?: string | null;
  noPrice?: string | null;
  primaryYesPrice?: string | null;
  primaryNoPrice?: string | null;
  endTime?: number;
};

function normalize(item: PantaMarket, index: number): Market {
  const yes = Number(item.yesPrice ?? item.primaryYesPrice ?? 0.5);
  const safeYes = Number.isFinite(yes) ? yes : 0.5;
  const seed = Math.round(safeYes * 100);

  return {
    marketId: item.marketId,
    category: item.category || "Other",
    title: item.title || "Untitled market",
    description: item.description || "No market description provided.",
    phase: item.phase || "primary",
    region: item.region || "Global",
    volumeUsdc: item.volumeUsdc || "0",
    yesPrice: safeYes.toFixed(4),
    noPrice: Number(item.noPrice ?? item.primaryNoPrice ?? 1 - safeYes).toFixed(4),
    endTime: item.endTime || Math.floor(Date.now() / 1000) + 30 * 86400,
    change24h: 0,
    sparkline: Array.from({ length: 12 }, (_, i) =>
      Math.max(2, Math.min(98, seed + Math.round(Math.sin(i + index) * 3))),
    ),
  };
}

export async function GET(request: Request) {
  const apiKey = process.env.PANTA_API_KEY;
  if (!apiKey) {
    const body: MarketsResponse = {
      items: previewMarkets,
      source: "preview",
      message: "Add PANTA_API_KEY to load live Panta markets.",
    };
    return Response.json(body);
  }

  const url = new URL(request.url);
  const upstream = new URL(`${PANTA_BASE.replace(/\/$/, "")}/markets/`);
  for (const key of ["category", "status", "cursor", "limit"]) {
    const value = url.searchParams.get(key);
    if (value) upstream.searchParams.set(key, value);
  }
  if (!upstream.searchParams.has("limit")) upstream.searchParams.set("limit", "30");

  try {
    const response = await fetch(upstream, {
      headers: { Accept: "application/json", "X-Api-Key": apiKey },
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) return Response.json(payload, { status: response.status });
    const body: MarketsResponse = {
      items: (payload.items || []).map(normalize),
      source: "panta",
    };
    return Response.json(body);
  } catch {
    return Response.json({ error: "Panta is temporarily unavailable." }, { status: 502 });
  }
}
