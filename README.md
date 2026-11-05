# MailPulse V0

Minimal open-signal tracking for emails sent manually through Gmail.

Live feasibility probe: https://mailpulse-assil.vercel.app

Implementation starts with a Gmail feasibility probe. The full dashboard and
production database changes depend on a repeatable manual send test passing.

## Current deliverable

The probe serves a transparent 1×1 GIF at `/api/pixel/[token]` and records only a
hashed synthetic probe ID and UTC timestamp in runtime logs. HEAD and malformed
tokens emit no signal. There is no database, authentication, recipient data, or
dashboard yet. Arbitrary well-formed tokens are accepted for the probe only.

## Local setup and checks

Use the Node version in `.nvmrc` and Python 3 (stdlib only for MIME inspection).

```bash
npm ci
cp .env.example .env.local
# Set APP_ORIGIN=http://127.0.0.1:3000 in .env.local for the paste fixture.
npm run dev
```

The home page never loads a pixel. `/probe/[token]` is an explicit paste fixture
and intentionally requests its pixel when opened. Do not use its URL as the image
source; use the `/api/pixel/[token]` URL returned by the generator.

```bash
npm run lint
npm run typecheck
npm test
npm run test:verifier
npm run build
npx playwright install chromium
npm run test:e2e
```

The Playwright suite starts a production server on port 3100 with an isolated
local origin. It verifies the GIF over HTTP and decodes it in a browser. The Node
suite independently decodes transparency and tests structured logging. No check
sends email or uses production Supabase.

## Vercel deployment

Import this repository into the `assil` Vercel team, use Next.js and Node 22.x,
and select `main` as the production branch. Turn off hosted preview deployments.
`vercel.json` also disables Git deployments from other branches. Keep production
public so Google can request the pixel without authentication or bot challenges.
Set `APP_ORIGIN` to the assigned stable HTTPS production origin and redeploy.
No Supabase credentials, Vercel tokens, or other secrets are needed for this probe.

GitHub Actions runs quality checks; Vercel Git integration owns deployment. Main
branch protection should require `Quality checks` and an up-to-date PR branch.
There are no GitHub Actions Vercel deploy steps or deployment credentials.

Follow [the Gmail test procedure](docs/gmail-feasibility.md) after the public GIF
smoke test. Current evidence and remaining gates are in [status](docs/status.md).

To roll back application code, use Vercel's deployment rollback control, verify
the public pixel response, and restore automatic production assignment before the
next release if rollback disabled it. There are no migrations to roll back yet.
Future database-write errors must be sanitized and observable while preserving the
GIF response; this probe only emits `mailpulse_probe_request` diagnostic events.

Open signals are observed image requests. Composition, sender views, scanners,
forwarding, blocked images, proxying, and caching can add or suppress them; they
do not establish unique readers or confirmed human opens.
