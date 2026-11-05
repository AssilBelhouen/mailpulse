"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in. Please try again.");
      router.replace("/dashboard"); router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in. Please try again.");
      setPending(false);
    }
  }
  return <form onSubmit={submit} className="space-y-5">
    <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email</label><Input id="email" name="email" type="email" autoComplete="username" required maxLength={254} disabled={pending} className="h-11 bg-white" /></div>
    <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">Password</label><Input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} disabled={pending} className="h-11 bg-white" /></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={pending} className="h-11 w-full">{pending ? "Signing in…" : "Sign in"}</Button>
  </form>;
}
