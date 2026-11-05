import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("probe command produces fresh opaque tokens, matching IDs and HTTPS HTML without network requests", () => {
  const outputs = Array.from({ length: 2 }, () => {
    const child = spawnSync(process.execPath, ["scripts/new-probe.mjs", "https://probe.example"], { encoding: "utf8" });
    assert.equal(child.status, 0, child.stderr);
    return JSON.parse(child.stdout);
  });
  assert.notEqual(outputs[0].token, outputs[1].token);
  for (const output of outputs) {
    assert.match(output.token, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(Buffer.from(output.token, "base64url").length, 32);
    assert.equal(output.pixel_url, `https://probe.example/api/pixel/${output.token}`);
    assert.equal(output.probe_id, createHash("sha256").update(output.token).digest("hex").slice(0, 16));
    assert.equal(output.html, `<img src="${output.pixel_url}" width="1" height="1" alt="">`);
  }
});

test("probe command rejects unsafe or ambiguous origins without echoing input", () => {
  for (const origin of ["http://remote.example", "https://user:secret@probe.example", "https://probe.example/path", "https://probe.example?email=private", "javascript:alert(1)"]) {
    const child = spawnSync(process.execPath, ["scripts/new-probe.mjs", origin], { encoding: "utf8" });
    assert.equal(child.status, 2);
    assert.equal(child.stdout, "");
    assert.equal(child.stderr.includes(origin), false);
  }
});
