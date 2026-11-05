import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
if (!url || !["127.0.0.1", "localhost"].includes(new URL(url).hostname)) throw new Error("Integration tests require local Supabase");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, options);
const anonymous = createClient(url, process.env.SUPABASE_PUBLISHABLE_KEY!, options);

test("local Auth, RLS, event privileges, concurrent aggregates and cascading deletion", async () => {
  const users: string[] = [];
  try {
    const clients = [];
    for (let i = 0; i < 2; i++) {
      const email = `integration-${randomUUID()}@example.invalid`;
      const password = `Synthetic-${randomUUID()}`;
      const result = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      assert.equal(result.error, null);
      users.push(result.data.user!.id);
      const client = createClient(url, process.env.SUPABASE_PUBLISHABLE_KEY!, options);
      assert.equal((await client.auth.signInWithPassword({ email, password })).error, null);
      clients.push(client);
    }
    const [a, b] = clients;
    const create = () => a.from("trackings").insert({ owner_id: users[0], recipient_email: "recipient@example.invalid" }).select().single();
    const first = await create();
    assert.equal(first.error, null, "the migration must provide owned trackings with server-generated tokens");
    const second = await create();
    assert.equal(second.error, null);
    assert.match(first.data.token, /^[A-Za-z0-9_-]{43}$/);
    assert.notEqual(first.data.token, second.data.token);
    assert.equal(first.data.token.includes("recipient"), false);
    assert.ok(Date.parse(first.data.created_at));
    assert.ok((await a.from("trackings").insert({ owner_id: users[1], recipient_email: "forged@example.invalid" })).error);
    assert.ok((await a.from("trackings").insert({ owner_id: users[0], recipient_email: "forged@example.invalid", token: "A".repeat(43) })).error);
    assert.ok((await a.from("trackings").update({ owner_id: users[1] }).eq("id", first.data.id)).error);
    assert.ok((await anonymous.from("trackings").select()).error);
    assert.deepEqual((await b.from("trackings").select().eq("id", first.data.id)).data, []);
    assert.deepEqual((await b.from("trackings").delete().eq("id", first.data.id).select()).data, []);
    for (const client of [anonymous, a, b]) {
      assert.ok((await client.rpc("record_tracking_event", { p_token: first.data.token })).error);
      assert.ok((await client.from("tracking_events").insert({ tracking_id: first.data.id })).error);
    }
    const results = await Promise.all(Array.from({ length: 12 }, () => admin.rpc("record_tracking_event", { p_token: first.data.token })));
    for (const result of results) { assert.equal(result.error, null); assert.equal(result.data, true); }
    assert.equal((await admin.rpc("record_tracking_event", { p_token: "unknown" })).data, false);
    const summary = await a.from("tracking_summaries").select().eq("id", first.data.id).single();
    assert.equal(summary.error, null);
    assert.equal(summary.data.signal_count, 12);
    assert.ok(Date.parse(summary.data.first_signal) <= Date.parse(summary.data.last_signal));
    assert.deepEqual((await b.from("tracking_summaries").select()).data, []);
    assert.deepEqual((await b.from("tracking_events").select()).data, []);
    assert.equal((await a.from("tracking_events").select()).data!.length, 12);
    assert.equal((await a.from("trackings").delete().eq("id", first.data.id)).error, null);
    assert.equal((await admin.rpc("record_tracking_event", { p_token: first.data.token })).data, false);
    assert.equal((await admin.from("tracking_events").select("id", { count: "exact", head: true }).eq("tracking_id", first.data.id)).count, 0);
    const signup = await anonymous.auth.signUp({ email: `disabled-${randomUUID()}@example.invalid`, password: `Synthetic-${randomUUID()}` });
    assert.ok(signup.error, "public signup must be disabled");
  } finally {
    for (const id of users) await admin.auth.admin.deleteUser(id);
  }
});
