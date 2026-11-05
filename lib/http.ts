import "server-only";
import { origin } from "./env";
import { sameOrigin } from "./validation";

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
export function mutationAllowed(request: Request) { return sameOrigin(request, origin()); }
export async function jsonBody(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("Use a JSON request body.");
  if (Number(request.headers.get("content-length")) > 2048) throw new Error("Request is too large.");
  const text = await request.text();
  if (Buffer.byteLength(text) > 2048) throw new Error("Request is too large.");
  const value = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid request body.");
  return value as Record<string, unknown>;
}
