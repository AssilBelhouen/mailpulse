import { execFileSync, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Local credentials stay in this process, never in the repository or command log.
const status = JSON.parse(execFileSync("npx", ["supabase", "status", "--output", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }));
const url = status.API_URL;
if (!url || !["localhost", "127.0.0.1"].includes(new URL(url).hostname)) throw new Error("Expected local Supabase");
const env = { ...process.env,
  SUPABASE_URL: url,
  SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY || status.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY || status.SECRET_KEY,
  APP_ORIGIN: "http://127.0.0.1:3100",
};
if (!env.SUPABASE_PUBLISHABLE_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Local keys missing");
// A database reset can finish before PostgREST's connection pool has recovered.
// Wait for a real, empty Data API read instead of hiding failures with test retries.
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    const response = await fetch(`${url}/rest/v1/trackings?select=id&limit=0`, {
      headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
      signal: AbortSignal.timeout(1000),
    });
    ready = response.ok;
    await response.body?.cancel();
  } catch { /* The local stack is still reconnecting. */ }
  if (ready) break;
  await delay(500);
}
if (!ready) throw new Error("Local Supabase Data API is not ready; start the stack and apply migrations.");
const command = process.argv.slice(2);
if (!command.length) throw new Error("Supply a command");
const result = spawnSync(command[0], command.slice(1), { env, stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
