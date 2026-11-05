import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const headers = {
  "Content-Type": "image/gif",
  "Content-Length": String(gif.length),
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(_request: Request, _context: { params: Promise<{ token: string }> }) {
  const { token } = await _context.params;
  if (/^[A-Za-z0-9_-]{43}$/.test(token)) {
    // Probe-only: synthetic tokens, no recipients or request metadata. This is
    // replaced by awaited database recording only after the Gmail gate passes.
    console.info(JSON.stringify({
      event: "mailpulse_probe_request",
      probe_id: createHash("sha256").update(token).digest("hex").slice(0, 16),
      observed_at: new Date().toISOString(),
    }));
  }
  return new Response(gif, { headers });
}

export async function HEAD() {
  return new Response(null, { headers });
}
