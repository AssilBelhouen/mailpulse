const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const headers = {
  "Content-Type": "image/gif", "Content-Length": String(gif.length),
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function pixelHandlers(record: (token: string) => Promise<boolean>) {
  return {
    async GET(_request: Request, context: { params: Promise<{ token: string }> }) {
      const { token } = await context.params;
      if (/^[A-Za-z0-9_-]{43}$/.test(token)) {
        try { await record(token); }
        catch { console.error("mailpulse_pixel_record_failed"); }
      }
      return new Response(gif, { headers });
    },
    async HEAD() { return new Response(null, { headers }); },
  };
}
