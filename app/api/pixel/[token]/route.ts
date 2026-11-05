import { pixelHandlers } from "../../../../lib/pixel";
import { recordImageRequest } from "../../../../lib/supabase/record";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const { GET, HEAD } = pixelHandlers(recordImageRequest);
