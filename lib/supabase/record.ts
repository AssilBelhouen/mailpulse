import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseSettings } from "../env";
import type { Database } from "../database.types";

export async function recordImageRequest(token: string): Promise<boolean> {
  const { url } = supabaseSettings();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Recording configuration missing");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5000) }) },
  });
  const { data, error } = await client.rpc("record_tracking_event", { p_token: token });
  if (error) throw new Error("Recording failed");
  return data === true;
}
