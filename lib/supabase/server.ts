import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cookieOptions, supabaseSettings } from "../env";
import type { Database } from "../database.types";

export async function createUserClient(readOnly = false) {
  const store = await cookies();
  const { url, key } = supabaseSettings();
  return createServerClient<Database>(url, key, {
    cookieOptions: cookieOptions(),
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        if (!readOnly) {
          for (const { name, value, options } of values) store.set(name, value, options);
          return;
        }
        try { for (const { name, value, options } of values) store.set(name, value, options); }
        catch { /* Server components use proxy.ts for refreshed cookies. */ }
      },
    },
  });
}

export async function authenticatedClient(readOnly = false) {
  const client = await createUserClient(readOnly);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return { client, user: data.user };
}
