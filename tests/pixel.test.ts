import assert from "node:assert/strict";
import { mock, test } from "node:test";
import sharp from "sharp";
import { pixelHandlers } from "../lib/pixel";

const token = "A".repeat(43);
const context = (value = token) => ({ params: Promise.resolve({ token: value }) });
const request = () => new Request(`https://mail.example/api/pixel/${token}`);

test("pixel GET returns a valid transparent GIF, awaits recording, and never sets cookies or validators", async () => {
  let resolve!: (value: boolean) => void;
  const written = new Promise<boolean>((done) => { resolve = done; });
  let responded = false;
  const { GET } = pixelHandlers(() => written);
  const pending = GET(request(), context()).then((r) => { responded = true; return r; });
  await new Promise(setImmediate);
  assert.equal(responded, false);
  resolve(true);
  const response = await pending;
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/gif");
  assert.equal(response.headers.get("cache-control"), "no-store, no-cache, must-revalidate, max-age=0");
  for (const header of ["set-cookie", "etag", "last-modified"]) assert.equal(response.headers.get(header), null);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(Number(response.headers.get("content-length")), bytes.length);
  const { info, data } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([info.width, info.height, data[3]], [1, 1, 0]);
});

test("HEAD and malformed tokens skip recording; unknown and deleted tokens return the same GIF", async () => {
  const seen: string[] = [];
  const { GET, HEAD } = pixelHandlers(async (value) => { seen.push(value); return false; });
  const head = await HEAD();
  assert.equal(head.status, 200);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  const expected = Buffer.from(await (await GET(request(), context())).arrayBuffer());
  for (const invalid of ["", "invalid", "a".repeat(44), "x@example.invalid", "!".repeat(43)]) {
    assert.deepEqual(Buffer.from(await (await GET(request(), context(invalid))).arrayBuffer()), expected);
  }
  assert.deepEqual(seen, [token]);
});

test("database failures preserve the GIF and emit only a sanitized operational error", async () => {
  const errors: unknown[] = [];
  const log = mock.method(console, "error", (...values: unknown[]) => { errors.push(values); });
  try {
    const { GET } = pixelHandlers(async () => { throw new Error(`private@example.invalid password ${token}`); });
    const response = await GET(request(), context());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/gif");
    assert.deepEqual(errors, [["mailpulse_pixel_record_failed"]]);
  } finally { log.mock.restore(); }
});
