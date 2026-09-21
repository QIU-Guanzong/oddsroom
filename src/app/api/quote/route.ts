const PANTA_BASE =
  process.env.PANTA_API_BASE_URL ?? "https://live-api.panta.market/api/v1";

export async function POST(request: Request) {
  const apiKey = process.env.PANTA_API_KEY;
  if (!apiKey) {
    return Response.json(
      { code: "PREVIEW_MODE", message: "Live quotes require a server-side Panta API key." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const side = String(body.side || "").toLowerCase();
  const amount = Number(body.amountUsdc);
  const wallet = String(body.wallet || "");
  const marketId = String(body.marketId || "");

  if (!wallet || !marketId || !["yes", "no"].includes(side) || amount < 1) {
    return Response.json(
      { code: "INVALID_QUOTE", message: "Wallet, market, side and a positive amount are required." },
      { status: 400 },
    );
  }

  const response = await fetch(`${PANTA_BASE.replace(/\/$/, "")}/primaryorderquote/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ wallet, marketId, side, amountUsdc: amount.toFixed(2) }),
    cache: "no-store",
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
