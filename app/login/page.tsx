import { redirect } from "next/navigation";
import { authenticatedClient } from "../../lib/supabase/server";
import { LoginForm } from "../../components/login-form";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await authenticatedClient(true)) redirect("/dashboard");
  return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-14">
    <span className="mb-12 text-xl font-semibold tracking-tight text-primary">MailPulse</span>
    <h1 className="text-3xl font-semibold tracking-tight">Sign in to your workspace</h1>
    <p className="mb-8 mt-3 text-muted-foreground">Create tracking pixels for the emails you send yourself.</p>
    <LoginForm />
    <p className="mt-7 text-sm text-muted-foreground">Access is by invitation. Contact your administrator for an account or password help.</p>
    <p className="mt-12 text-xs leading-relaxed text-muted-foreground">An image request is an approximate signal, not confirmation that someone read an email.</p>
  </main>;
}
