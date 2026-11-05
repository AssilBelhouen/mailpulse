# MailPulse V0

A small dashboard for image-request signals from emails sent manually through Gmail.
Create one tracking per intended email, copy its pixel URL, and use Gmail web's
Insert photo → Web address (URL). Send manually. MailPulse never connects to Gmail
or sends email.

[Production](https://mailpulse-assil.vercel.app) · [Release status](docs/status.md) ·
[Validated Gmail procedure and limitations](docs/gmail-feasibility.md)

Image requests are approximate signals. Composition, sender views, scanners and
forwarding can add requests. Blocking, Spam handling, proxies and caching can
suppress them, including repeated human openings. Counts are neither unique
readers nor confirmed human opens. The dashboard never loads its tracking images.

## Run locally

Use the pinned Node version in `.nvmrc`, Docker and Python 3. Dependencies, including
the Supabase CLI, are pinned in the committed npm lockfile.

```bash
npm ci
npx supabase start --exclude realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor,mailpit
npx supabase db reset --no-seed
node scripts/with-local-env.mjs npm run dev -- --port 3100
```

The wrapper obtains local keys without writing an environment file and refuses
remote URLs. Create a confirmed synthetic account in local Supabase Auth using
its admin API; signup is disabled. Alternatively copy `.env.example` to
`.env.local` and fill in your development project values. Never commit this file.
`APP_ORIGIN` must match the origin used in the browser for mutation requests.

```bash
npm run lint
npm run typecheck
npm test
npm run test:verifier
npm run build
npm run test:integration
npx playwright install chromium
npm run test:e2e
```

Integration and browser tests require the running local stack. They create and
remove synthetic accounts under `example.invalid`; they refuse production URLs.
Integration tests include real RLS/Auth, concurrent RPCs, cascade deletion, and a
production HTTP server pointed at an unavailable database. Playwright covers
login, management routes, ownership, copy safety, pixel counts, pagination and
mobile layout. Tests never send email. CI replays migrations and runs these same
checks. Main requires passing `Quality checks` and an up-to-date PR branch.

## Accounts and data

In Supabase administration, disable public signup and anonymous sign-ins. Keep
email/password login enabled and set Site URL to the stable production origin.
Provision email-confirmed invited users and passwords manually. Handle password
changes manually in administration; V0 has no signup, invitation or reset UI and
requires no SMTP setup. Share credentials with each invited user privately.

Each tracking stores only its owner, recipient email, random token and creation
time. Events store only the tracking ID and a database-generated UTC timestamp.
The database generates tokens from 32 cryptographically random bytes encoded as
base64url. RLS and narrow column privileges isolate users and prevent client event
writes. A service-only function records pixel requests. The dashboard displays
database aggregates and formats timestamps in the viewer's timezone.

Keep records until the owner deletes them. Deletion permanently cascades to
all events; later requests to that token still return a GIF but record nothing.
No names, subjects, message bodies, IP addresses, user agents or device identifiers
are stored by the application. Hosting providers may maintain their own request
logs; avoid exporting raw access logs into application diagnostics.

## Deployment and operation

Use the existing production Supabase MailPulse project and Vercel `assil/mailpulse`
project. Set the four variables in `.env.example` directly in Vercel production.
The server secret must never enter browser code or public reports. Use the stable
`https://mailpulse-assil.vercel.app` as `APP_ORIGIN`.

After changing production variables, create a fresh Git deployment and verify actual
event writes. The [deployment recreation API](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment)
inherits the original environment when `deploymentId` is supplied; it does not prove
that a newly saved project secret was used.

Apply the committed migration before releasing dependent code. For subsequent
releases, authenticate the pinned CLI, link the intended project, inspect the
pending migration, then use `npx supabase db push --remote --dry-run` followed by
`npx supabase db push --remote --yes`. Keep migrations additive and compatible with
the preceding application. Verify migration history and security/performance
advisors afterward. Never reset a hosted database.

The first migration was generated and replayed with the CLI locally, then applied
through the connected Supabase MCP because hosted CLI authentication was unavailable.
Its committed version matches hosted migration history; subsequent changes should
use the CLI workflow above.

Vercel Git integration deploys protected `main` automatically. Hosted previews
are disabled in the project and `vercel.json`; GitHub Actions needs no Vercel
credentials or separate deployment job. Keep the pixel route public, without
Vercel Authentication, challenge rules or a login redirect. Management routes
require server-verified sessions and same-origin mutation requests.

After deploying, check unauthenticated GET/HEAD GIF access and dashboard protection,
then use a synthetic invited account to create a record, request its pixel, refresh
the dashboard, delete the record and request its old pixel. Remove the synthetic
account afterward. A GIF alone does not prove that the database write succeeded.

A pixel write is awaited with a five-second database fetch timeout. A failed write
still returns the GIF and emits only `mailpulse_pixel_record_failed`. Inspect that
literal marker in Vercel function logs, then project health/database logs in
Supabase. Do not add token, URL, address, credentials, IP or user-agent fields to
logs. Management failures return explicit errors.

To roll back code, use Vercel's rollback control to promote the preceding healthy
production deployment and verify the public GIF and login protection again. Keep
additive database migrations in place; dropping tables would destroy data. Restore
normal production assignment before the next release if rollback disabled it.
The old feasibility probe records synthetic logs only, so rolling back to it
suspends durable event recording; take that tradeoff explicitly during recovery.

The `/probe/[token]` route remains an explicit diagnostic fixture that intentionally
loads its image. The dashboard never links to it. Unknown tokens no longer record
probe logs. Development-only `probe:new` and `probe:verify` scripts support MIME
inspection; keep real `.eml` files outside Git.
