import { createHash, randomBytes } from "node:crypto";

try {
  if (process.argv.length !== 3) throw new Error("Expected one origin");
  const origin = new URL(process.argv[2]);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if ((origin.protocol !== "https:" && !(origin.protocol === "http:" && local)) ||
      origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("Invalid origin");
  }
  const token = randomBytes(32).toString("base64url");
  const pixelUrl = `${origin.origin}/api/pixel/${token}`;
  console.log(JSON.stringify({
    token,
    probe_id: createHash("sha256").update(token).digest("hex").slice(0, 16),
    pixel_url: pixelUrl,
    fixture_url: `${origin.origin}/probe/${token}`,
    html: `<img src="${pixelUrl}" width="1" height="1" alt="">`,
  }, null, 2));
} catch {
  console.error("Usage: npm run probe:new -- HTTPS_ORIGIN (HTTP allowed only for localhost)");
  process.exitCode = 2;
}
