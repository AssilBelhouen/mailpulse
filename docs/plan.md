# MailPulse V0 accepted implementation plan

## Binding scope

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase PostgreSQL/Auth,
and Vercel. Public repository: `AssilBelhouen/mailpulse`. Production database:
the existing MailPulse project, ref `kymmzarhrpozxexszhxh`.

Invited users only; provision email/password accounts manually, public signup off.
Each intended email gets a fresh opaque 32-byte base64url token. No Gmail API,
OAuth, sending, automation, extensions, campaigns, notifications, or realtime.
Count raw image GET requests, not confirmed human opens. Retain data until deletion.

### Task 1: Gmail feasibility probe

Deploy a public HTTPS transparent 1×1 GIF endpoint using synthetic tokens and
timestamped probe logs, without recipient addresses or Supabase changes. Test native
remote-image insertion, then rendered HTML paste, then manual draft DOM editing.
The user sends between accounts they control. Inspect decoded received MIME HTML
for the original image source; compare compose/delivery/open/block/reopen requests.
Repeat the successful method with fresh messages. Document actual observations.

Expected: a repeatable insertion method preserves the external URL and recipient
image loading can reach the origin. Stop full development if this fails or evidence
is unavailable. The probe's code and automated checks do not establish this result.

Verification: lint, typecheck, Node tests, Python MIME-verifier tests, production
build, Playwright HTTP/browser checks, public HTTPS smoke check, then real Gmail
send tests. Complete a single independent review of the probe before publishing.

### Task 2: Authentication and database (gated by Task 1)

Implement server-verified Supabase email/password sessions, login/logout, no signup
UI. Two tables: trackings (UUID, owner UUID, recipient email, unique token, created
UTC timestamp); tracking_events (ID, tracking UUID, database UTC timestamp).
Owner RLS for tracking creation/read/deletion and event reads. No browser event
writes. Service-role-only event-recording RPC; key server-only. Cascade deletion.
Index token, owner/creation, event tracking/time. Database aggregates for counts,
first, and last timestamps. No bodies, subjects, names, IPs, UAs, or device data.
Use versioned additive migrations and test locally before production.

### Task 3: API and dashboard (gated by Task 1)

Authenticated POST/GET /api/trackings, DELETE /api/trackings/[id], 50 rows/page.
Same-origin mutation checks; explicit errors. Stable configured production origin
for URLs, never Host or preview origin. Public GET /api/pixel/[token] records once;
HEAD records nothing. Invalid/deleted tokens return the same GIF, no event. Await
recording; on DB failure return GIF and emit sanitized operational failure.

Responsive Tailwind/shadcn dashboard: email input, creation, table of recipient,
created time, URL, first/last signal, count; copy URL/HTML, manual refresh, pagination,
delete confirmation. Display viewer timezone. Never auto-render a tracking image.
Document the tested Gmail method and proxy/cache/scanner/forwarding ambiguity.

### Task 4: Release and verification

Npm lockfile, pinned supported Node, README, env example, project agent guidance.
GitHub Actions: lint, types, focused tests, build, Playwright, local Supabase auth/DB
integration tests. Required PR checks and up-to-date main. Vercel Git integration,
production main only; hosted previews disabled. Configure production secrets in
Vercel, apply migrations before dependent code, then smoke-test authenticated
creation → public pixel → aggregate → deletion. Document rollback and error checks.

Acceptance includes per-email token uniqueness, transparent GIF decoding, exact
event counts under concurrency, HEAD/invalid/deleted no-write behavior, cross-user
and anonymous isolation through API and Supabase, denied direct recording RPC,
no dashboard-triggered signals, outage behavior, and real Gmail feasibility evidence.
