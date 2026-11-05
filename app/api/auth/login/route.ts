import { createUserClient } from "../../../../lib/supabase/server";
import { json, jsonBody, mutationAllowed } from "../../../../lib/http";

export async function POST(request: Request) {
  try {
    if (!mutationAllowed(request)) return json({ error: "Request origin is not allowed." }, 403);
    let body;
    try { body = await jsonBody(request); } catch { return json({ error: "Invalid sign-in request." }, 400); }
    if (typeof body.email !== "string" || body.email.length > 254 || typeof body.password !== "string" || !body.password || body.password.length > 256) return json({ error: "Enter your email and password." }, 400);
    const client = await createUserClient();
    const { error } = await client.auth.signInWithPassword({ email: body.email.trim(), password: body.password });
    if (error) return json({ error: "Email or password was not accepted." }, error.status && error.status >= 500 ? 503 : 401);
    return json({ ok: true });
  } catch {
    console.error("mailpulse_login_failed");
    return json({ error: "Sign-in is unavailable. Please try again." }, 503);
  }
}
