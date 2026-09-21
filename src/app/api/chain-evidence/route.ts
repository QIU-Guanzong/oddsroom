import { validMint, WRAPPED_SOL } from "@/lib/solami";
import { createEvidenceReader } from "@/lib/solami-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const read = createEvidenceReader();
export async function GET(request: Request) {
  const mint = new URL(request.url).searchParams.get("mint") ?? WRAPPED_SOL;
  const headers = { "Cache-Control": "no-store" };
  if (!validMint(mint)) return Response.json({ error: "Enter a valid 32-byte Solana mint address." }, { status: 400, headers });
  const result = await read(mint, process.env.SOLAMI_API_KEY);
  return Response.json(result, { headers, status: result.status === "unavailable" ? 502 : 200 });
}
