import assert from "node:assert/strict";
import { test } from "node:test";
import { emailAddress, pageNumber, sameOrigin, publicOrigin } from "../lib/validation";

test("management validation rejects injection, invalid origins and unbounded pagination", () => {
  assert.equal(emailAddress("  Synthetic+test@example.invalid  "), "Synthetic+test@example.invalid");
  for (const value of [null, "", "a@", "a@example.invalid\r\nBcc: x@y.invalid", "a b@example.invalid", "x".repeat(255)]) {
    assert.throws(() => emailAddress(value));
  }
  assert.equal(pageNumber(null), 1);
  assert.equal(pageNumber("2"), 2);
  for (const value of ["0", "-1", "NaN", "1.5", "1e2", "100001"]) assert.throws(() => pageNumber(value));
  assert.equal(publicOrigin("https://mail.example"), "https://mail.example");
  for (const value of [undefined, "https://mail.example/path", "https://user:secret@mail.example", "http://mail.example"]) {
    assert.throws(() => publicOrigin(value));
  }
  assert.equal(sameOrigin(new Request("https://untrusted.example", { headers: { origin: "https://mail.example" } }), "https://mail.example"), true);
  for (const origin of ["https://evil.example", "null", "https://mail.example.evil.example"]) {
    assert.equal(sameOrigin(new Request("https://mail.example", { headers: { origin } }), "https://mail.example"), false);
  }
  assert.equal(sameOrigin(new Request("https://mail.example"), "https://mail.example"), false);
});
