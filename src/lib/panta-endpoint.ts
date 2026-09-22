const PANTA_BASE = new URL("https://live-api.panta.market/api/v1");

/**
 * Keep catalog credentials pinned to Panta's documented production endpoint.
 * A hosting typo must fail closed instead of forwarding X-Api-Key to another host.
 */
export function pantaMarketsUrl(
  requestUrl: string,
  configuredBase = process.env.PANTA_API_BASE_URL,
): URL | null {
  let configured: URL;
  try {
    configured = new URL(configuredBase?.trim() || PANTA_BASE.href);
  } catch {
    return null;
  }
  if (
    configured.protocol !== "https:" ||
    configured.origin !== PANTA_BASE.origin ||
    configured.pathname.replace(/\/+$/, "") !== PANTA_BASE.pathname ||
    configured.username ||
    configured.password ||
    configured.search ||
    configured.hash
  ) {
    return null;
  }

  const request = new URL(requestUrl);
  const upstream = new URL(`${PANTA_BASE.href}/markets/`);
  for (const key of ["category", "status", "cursor"]) {
    const value = request.searchParams.get(key);
    if (value && value.length <= 256) upstream.searchParams.set(key, value);
  }
  const limit = request.searchParams.get("limit");
  upstream.searchParams.set("limit", /^(?:[1-9]|[12]\d|30)$/.test(limit ?? "") ? limit! : "30");
  return upstream;
}
