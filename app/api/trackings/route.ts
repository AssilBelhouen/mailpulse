import { authenticatedClient } from "../../../lib/supabase/server";
import { origin } from "../../../lib/env";
import { json, jsonBody, mutationAllowed } from "../../../lib/http";
import { emailAddress, pageNumber } from "../../../lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await authenticatedClient();
    if (!auth) return json({ error: "Sign in to continue." }, 401);
    let page;
    try { page = pageNumber(new URL(request.url).searchParams.get("page")); }
    catch { return json({ error: "Invalid page." }, 400); }
    const { data, error, count } = await auth.client.from("tracking_summaries").select("id,recipient_email,token,created_at,signal_count,first_signal,last_signal", { count: "exact" })
      .eq("owner_id", auth.user.id).order("created_at", { ascending: false }).order("id", { ascending: false }).range((page - 1) * 50, page * 50 - 1);
    if (error) throw new Error("Database read failed");
    return json({ items: (data ?? []).map((row) => ({ ...row, pixel_url: `${origin()}/api/pixel/${row.token}` })), total: count ?? 0, page, page_size: 50 });
  } catch {
    console.error("mailpulse_tracking_list_failed");
    return json({ error: "Could not load trackings. Please try again." }, 503);
  }
}

export async function POST(request: Request) {
  try {
    if (!mutationAllowed(request)) return json({ error: "Request origin is not allowed." }, 403);
    const auth = await authenticatedClient();
    if (!auth) return json({ error: "Sign in to continue." }, 401);
    let email;
    try { email = emailAddress((await jsonBody(request)).recipient_email); }
    catch { return json({ error: "Enter a valid recipient email address." }, 400); }
    // PostgreSQL generates the 32-byte random token. Column grants prevent clients
    // from supplying their own predictable tokens or creation timestamps.
    const { data, error } = await auth.client.from("trackings").insert({ owner_id: auth.user.id, recipient_email: email }).select("id,recipient_email,token,created_at").single();
    if (error || !data) throw new Error("Database insert failed");
    return json({ ...data, pixel_url: `${origin()}/api/pixel/${data.token}` }, 201);
  } catch {
    console.error("mailpulse_tracking_create_failed");
    return json({ error: "Could not create tracking. Please try again." }, 503);
  }
}
