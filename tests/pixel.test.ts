import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { GET, HEAD } from "../app/api/pixel/[token]/route";

const token = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const context = (value = token) => ({ params: Promise.resolve({ token: value }) });
const request = () => new Request(`https://probe.example/api/pixel/${token}?recipient=private@example.invalid`, {
  headers: { "user-agent": "private-device", "x-forwarded-for": "192.0.2.1", cookie: "private-session=value" },
});

test("GET serves a decodable single transparent pixel without cookies or cache validators", async () => {
  const log = mock.method(console, "info", () => undefined);
  try {
    const response = await GET(request(), context());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/gif");
    assert.equal(response.headers.get("cache-control"), "no-store, no-cache, must-revalidate, max-age=0");
    for (const name of ["set-cookie", "etag", "last-modified"]) assert.equal(response.headers.get(name), null);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(Number(response.headers.get("content-length")), bytes.length);
    const decoded = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(decoded.info.width, 1);
    assert.equal(decoded.info.height, 1);
    assert.equal(decoded.info.channels, 4);
    assert.equal(decoded.data[3], 0);
  } finally { log.mock.restore(); }
});

test("each GET emits only an opaque probe ID and a server timestamp, including concurrent requests", async () => {
  const entries: string[] = [];
  const log = mock.method(console, "info", (entry: string) => { entries.push(entry); });
  try {
    const before = Date.now();
    await Promise.all(Array.from({ length: 8 }, () => GET(request(), context())));
    assert.equal(entries.length, 8);
    for (const line of entries) {
      const entry = JSON.parse(line);
      assert.deepEqual(Object.keys(entry).sort(), ["event", "observed_at", "probe_id"]);
      assert.equal(entry.event, "mailpulse_probe_request");
      assert.equal(entry.probe_id, createHash("sha256").update(token).digest("hex").slice(0, 16));
      assert.ok(Date.parse(entry.observed_at) >= before);
      assert.ok(Date.parse(entry.observed_at) <= Date.now());
      for (const secret of [token, "private@example", "private-device", "192.0.2.1", "private-session", "https://"]) {
        assert.equal(line.includes(secret), false);
      }
    }
  } finally { log.mock.restore(); }
});

test("HEAD and malformed tokens do not emit signals, and invalid GETs serve the same GIF", async () => {
  const entries: string[] = [];
  const log = mock.method(console, "info", (entry: string) => { entries.push(entry); });
  try {
    const head = await HEAD();
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("content-type"), "image/gif");
    assert.equal((await head.arrayBuffer()).byteLength, 0);
    for (const invalid of ["", "short", "a".repeat(44), "recipient@example.invalid", "!".repeat(43)]) {
      const response = await GET(request(), context(invalid));
      assert.equal(response.status, 200);
      const { info, data } = await sharp(Buffer.from(await response.arrayBuffer())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      assert.equal(info.width, 1);
      assert.equal(data[3], 0);
    }
    assert.equal(entries.length, 0);
  } finally { log.mock.restore(); }
});
