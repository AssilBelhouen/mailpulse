import { redirect } from "next/navigation";
import { authenticatedClient } from "../../lib/supabase/server";
import { Dashboard } from "../../components/dashboard";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  if (!await authenticatedClient(true)) redirect("/login");
  return <Dashboard />;
}
