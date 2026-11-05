import "server-only";
import { publicOrigin } from "./validation";

export function origin() { return publicOrigin(process.env.APP_ORIGIN); }
export function supabaseSettings() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase server configuration missing");
  return { url, key };
}
export function cookieOptions() {
  return { httpOnly: true, secure: origin().startsWith("https:"), sameSite: "lax" as const, path: "/" };
}
