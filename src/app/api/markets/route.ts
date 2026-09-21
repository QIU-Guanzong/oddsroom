import { normalizePantaMarket } from "@/lib/panta-normalize";
import { previewMarkets, type MarketsResponse } from "@/lib/markets";

const PANTA_BASE =
  process.env.PANTA_API_BASE_URL ?? "https://live-api.panta.market/api/v1";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const apiKey = process.env.PANTA_API_KEY;
  if (!apiKey) {
    const body: MarketsResponse = {
      items: previewMarkets,
      source: "preview",
      message: "Add PANTA_API_KEY to load live Panta markets.",
    };
    return Response.json(body, { headers });
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
      signal: AbortSignal.timeout(8000),
      redirect: "error",
    });
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload.items)) return Response.json({ error: "Panta markets are unavailable." }, { status: 502, headers });
    const body: MarketsResponse = {
      items: payload.items.map(normalizePantaMarket).filter((item: ReturnType<typeof normalizePantaMarket>) => item !== null),
      source: "panta",
    };
    return Response.json(body, { headers });
  } catch {
    return Response.json({ error: "Panta is temporarily unavailable." }, { status: 502, headers });
  }
}
