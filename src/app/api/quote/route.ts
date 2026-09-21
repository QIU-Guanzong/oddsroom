const PANTA_BASE = process.env.PANTA_API_BASE_URL ?? "https://live-api.panta.market/api/v1";

export async function POST(request: Request) {
  const apiKey = process.env.PANTA_API_KEY;
  if (!apiKey) return Response.json(
    { code: "PREVIEW_MODE", message: "Live quotes require a server-side Panta API key." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed;
  } catch {
    return Response.json({ code: "INVALID_QUOTE", message: "A JSON object is required." }, { status: 400 });
  }
  const side = String(body.side || "").toLowerCase();
  const amount = Number(body.amountUsdc);
  const wallet = String(body.wallet || "");
  const marketId = String(body.marketId || "");
  if (!wallet || !marketId || !["yes", "no"].includes(side) || !Number.isFinite(amount) || amount < 1 || amount > Number.MAX_SAFE_INTEGER) {
    return Response.json({ code: "INVALID_QUOTE", message: "Wallet, market, side and a valid amount are required." }, { status: 400 });
  }
  try {
    const response = await fetch(`${PANTA_BASE.replace(/\/$/, "")}/primaryorderquote/`, {
      method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Api-Key": apiKey },
      body: JSON.stringify({ wallet, marketId, side, amountUsdc: amount.toFixed(2) }),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Unavailable");
    return Response.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ code: "QUOTE_UNAVAILABLE", message: "Panta quotes are temporarily unavailable." }, { status: 502 });
  }
}
