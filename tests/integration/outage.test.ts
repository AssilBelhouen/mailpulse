import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import sharp from "sharp";

test("real HTTP handler returns a GIF and sanitized error when database transport is unavailable", { timeout: 30000 }, async () => {
  const socket = createServer();
  socket.listen(0, "127.0.0.1"); await once(socket, "listening");
  const address = socket.address();
  if (!address || typeof address === "string") throw new Error("No test port");
  const port = address.port;
  await new Promise<void>((resolve) => socket.close(() => resolve()));
  let output = "";
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, APP_ORIGIN: `http://127.0.0.1:${port}`, SUPABASE_URL: "http://127.0.0.1:9", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const closed = once(server, "close");
  server.stdout.on("data", (value) => { output += value; });
  server.stderr.on("data", (value) => { output += value; });
  try {
    const base = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { ready = (await fetch(`${base}/api/pixel/invalid`)).ok; } catch { /* Wait for the local server. */ }
      if (ready) break;
      await delay(100);
    }
    assert.ok(ready);
    const token = "X".repeat(43);
    const response = await fetch(`${base}/api/pixel/${token}?recipient=private@example.invalid`, { headers: { "user-agent": "private-device", cookie: "private-cookie=value" } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/gif");
    assert.equal(response.headers.get("set-cookie"), null);
    const { info, data } = await sharp(Buffer.from(await response.arrayBuffer())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual([info.width, info.height, data[3]], [1, 1, 0]);
    assert.match(output, /mailpulse_pixel_record_failed/);
    for (const sensitive of [token, "private@example.invalid", "private-device", "private-cookie", process.env.SUPABASE_SERVICE_ROLE_KEY!]) assert.equal(output.includes(sensitive), false);
  } finally { server.kill("SIGTERM"); await closed; }
});
