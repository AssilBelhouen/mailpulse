"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

type Tracking = { id: string; recipient_email: string; pixel_url: string; created_at: string; signal_count: number; first_signal: string | null; last_signal: string | null };
type Listing = { items: Tracking[]; page: number; total: number; page_size: number };
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: "no-store", ...init });
  if (response.status === 401) throw new Error("Your session expired. Sign out and sign in again.");
  if (response.status === 204) return undefined as T;
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The request failed. Please try again.");
  return result as T;
}
function timestamp(value: string | null) {
  return value ? <time dateTime={value} title={value}>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))}</time> : <span className="text-muted-foreground">No signal</span>;
}

export function Dashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Tracking[]>([]), [total, setTotal] = useState(0);
  const [page, setPage] = useState(1), [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true), [creating, setCreating] = useState(false);
  const [email, setEmail] = useState(""), [error, setError] = useState(""), [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Tracking | null>(null), [deleting, setDeleting] = useState(false);
  const [zone, setZone] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api<Listing>(`/api/trackings?page=${page}`, { signal: controller.signal }).then((result) => {
      setItems(result.items); setTotal(result.total);
      setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }).catch((e: Error) => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, revision]);
  function refresh(nextPage = page) { setLoading(true); setError(""); setPage(nextPage); setRevision((n) => n + 1); }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreating(true); setError(""); setStatus("");
    try {
      await api("/api/trackings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient_email: email }) });
      setEmail(""); setStatus("Tracking created. Copy its URL below and insert it once in your email."); refresh(1);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create tracking. Try again."); }
    finally { setCreating(false); }
  }
  async function copy(item: Tracking, html: boolean) {
    try {
      await navigator.clipboard.writeText(html ? `<img src="${item.pixel_url}" width="1" height="1" alt="">` : item.pixel_url);
      setStatus(html ? "HTML snippet copied." : "URL copied.");
    } catch { setError("Could not copy. Select and copy the URL directly from the table."); }
  }
  async function remove() {
    if (!selected) return;
    setDeleting(true); setError("");
    try {
      await api(`/api/trackings/${selected.id}`, { method: "DELETE" });
      setSelected(null); setStatus("Tracking and its image-request events deleted.");
      refresh(items.length === 1 && page > 1 ? page - 1 : page);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete. Try again."); }
    finally { setDeleting(false); }
  }
  async function logout() {
    try { await api("/api/auth/logout", { method: "POST" }); router.replace("/login"); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not sign out. Try again."); }
  }
  const pages = Math.max(1, Math.ceil(total / 50));
  return <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-10">
    <header className="mb-12 flex items-center justify-between border-b pb-6">
      <span className="text-xl font-semibold tracking-tight text-primary">MailPulse <span className="ml-2 text-xs font-normal text-muted-foreground">V0</span></span>
      <Button variant="ghost" onClick={logout}>Sign out</Button>
    </header>
    <main>
      <h1 className="text-3xl font-semibold tracking-tight">Email open signals</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Create a fresh pixel for each email you send manually. Review the image requests it receives.</p>
      <form onSubmit={create} className="my-8 flex max-w-2xl flex-col items-start gap-3 sm:flex-row sm:items-end">
        <div className="w-full flex-1 space-y-2"><label htmlFor="recipient" className="text-sm font-medium">Recipient email</label><Input id="recipient" type="email" placeholder="recipient@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} disabled={creating} className="h-11 bg-white" /></div>
        <Button type="submit" disabled={creating} className="h-11">{creating ? "Creating…" : "Create tracking"}</Button>
      </form>
      <p className="mb-5 max-w-4xl text-sm leading-relaxed text-muted-foreground"><strong className="font-medium text-foreground">Image requests are not confirmed human opens.</strong> Composing, sender views, scanners and forwarding can add signals. Image blocking, proxies, Spam handling and caching can suppress them—including repeat opens.</p>
      <p role="status" aria-live="polite" className="min-h-6 text-sm text-primary">{status}</p>
      {error && <p role="alert" className="my-3 text-sm text-destructive">{error}</p>}
      <section aria-labelledby="trackings-heading" className="mt-6 min-w-0 overflow-hidden rounded-lg border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"><div><h2 id="trackings-heading" className="font-semibold">Your trackings</h2><p className="text-xs text-muted-foreground">{total} {total === 1 ? "tracking" : "trackings"}</p></div><Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>{loading ? "Loading…" : "Refresh"}</Button></div>
        {loading ? <p className="p-8 text-sm text-muted-foreground" aria-live="polite">Loading trackings…</p> : items.length === 0 ? <div className="px-6 py-16 text-center"><h3 className="font-medium">{error ? "Trackings could not be loaded" : "Create your first tracking"}</h3><p className="mt-2 text-sm text-muted-foreground">{error ? "Use Refresh to try again." : "Enter a recipient above. Use a new tracking for each email, even for the same recipient."}</p></div> : <Table className="min-w-[1130px] text-sm">
          <TableHeader><TableRow><TableHead className="pl-5">Recipient / created</TableHead><TableHead>Tracking URL</TableHead><TableHead>First signal</TableHead><TableHead>Last signal</TableHead><TableHead className="text-right">Requests</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
          <TableBody>{items.map((item) => <TableRow key={item.id}>
            <TableCell className="max-w-64 py-5 pl-5"><p className="truncate font-medium" title={item.recipient_email}>{item.recipient_email}</p><p className="mt-1 text-xs text-muted-foreground">{timestamp(item.created_at)}</p></TableCell>
            <TableCell className="max-w-80"><code className="block select-all overflow-hidden text-ellipsis text-xs" title={item.pixel_url}>{item.pixel_url}</code><div className="mt-2 flex gap-1"><Button variant="outline" size="xs" onClick={() => copy(item, false)}>Copy URL</Button><Button variant="ghost" size="xs" onClick={() => copy(item, true)}>Copy HTML</Button></div></TableCell>
            <TableCell className="text-xs tabular-nums">{timestamp(item.first_signal)}</TableCell><TableCell className="text-xs tabular-nums">{timestamp(item.last_signal)}</TableCell>
            <TableCell data-testid="signal-count" className="text-right font-medium tabular-nums">{item.signal_count.toLocaleString()}</TableCell>
            <TableCell className="pr-5"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setSelected(item)}>Delete</Button></TableCell>
          </TableRow>)}</TableBody>
        </Table>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs text-muted-foreground"><span>Times in {zone || "your timezone"}. <span className="sm:hidden">Scroll the table to see all columns.</span></span><div className="flex items-center gap-3"><Button variant="outline" size="sm" disabled={loading || page === 1} onClick={() => refresh(page - 1)}>Previous</Button><span>Page {page} of {pages}</span><Button variant="outline" size="sm" disabled={loading || page >= pages} onClick={() => refresh(page + 1)}>Next</Button></div></div>
      </section>
      <details className="my-8 max-w-3xl text-sm"><summary className="py-2 font-medium text-primary">How to insert your pixel in Gmail</summary><div className="mt-3 space-y-3 text-muted-foreground"><p>Copy the tracking URL. In a fresh Gmail web draft, choose Insert photo → Web address (URL), paste the URL and insert it once. The 1×1 image is transparent. Send the message yourself.</p><p>This method was verified with Gmail web and Microsoft Edge. Requests can start while you compose. Gmail-to-Gmail Spam delivery also preserved the URL but produced no recipient-view request in our test. A missing signal does not mean the email was unread.</p><p>Copy HTML is for an HTML editor or manual draft editing. Pasting literal HTML code into Gmail does not insert an image.</p><p>Deleting a tracking permanently removes its events and stops that URL recording. Otherwise, records remain until you delete them.</p></div></details>
    </main>
    <AlertDialog open={!!selected} onOpenChange={(open) => { if (!open && !deleting) setSelected(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this tracking?</AlertDialogTitle><AlertDialogDescription className="break-words">Permanently delete the tracking for {selected?.recipient_email} and all its image-request events. Its URL will stop recording. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={deleting} onClick={(event) => { event.preventDefault(); void remove(); }}>{deleting ? "Deleting…" : "Delete tracking"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
