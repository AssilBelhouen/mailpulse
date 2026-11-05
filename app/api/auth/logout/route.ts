import { createUserClient } from "../../../../lib/supabase/server";
import { json, mutationAllowed } from "../../../../lib/http";

export async function POST(request: Request) {
  try {
    if (!mutationAllowed(request)) return json({ error: "Request origin is not allowed." }, 403);
    const client = await createUserClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return json({ error: "Could not sign out. Please try again." }, 503);
    return json({ ok: true });
  } catch {
    console.error("mailpulse_logout_failed");
    return json({ error: "Could not sign out. Please try again." }, 503);
  }
}
