import { authenticatedClient } from "../../../../lib/supabase/server";
import { json, mutationAllowed } from "../../../../lib/http";
import { validId } from "../../../../lib/validation";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!mutationAllowed(request)) return json({ error: "Request origin is not allowed." }, 403);
    const auth = await authenticatedClient();
    if (!auth) return json({ error: "Sign in to continue." }, 401);
    const { id } = await context.params;
    if (!validId(id)) return json({ error: "Tracking not found." }, 404);
    const { data, error } = await auth.client.from("trackings").delete().eq("id", id).eq("owner_id", auth.user.id).select("id").maybeSingle();
    if (error) throw new Error("Database delete failed");
    if (!data) return json({ error: "Tracking not found." }, 404);
    return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    console.error("mailpulse_tracking_delete_failed");
    return json({ error: "Could not delete tracking. Please try again." }, 503);
  }
}
