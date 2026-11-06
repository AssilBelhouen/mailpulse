# Implementation status

- Added a shared envelope/pulse logo on login and dashboard, with the same SVG
  used as the favicon. Public `/llms.txt` links to `/agent-skill.md`, a browser
  usage guide covering the signed-in workflow, pixel request side effects,
  approximate signals, manual Gmail sending and authorized deletion. The guide
  is discoverable from both app screens and the document's `describedby` link.

- Gmail feasibility **passed**: two fresh native Gmail web URL insertions preserved
  the original external URL in received MIME and each produced a new origin request
  after controlled Outlook web opening in Microsoft Edge on 2026-11-05.
- Both trials produced requests before recipient opening. Reselecting the second
  message produced no additional origin request. Exact cache attribution is unknown.
- A third Gmail-to-Gmail trial preserved one external URL but landed in Spam. The
  recipient's “Ask before displaying external images” setting was confirmed and
  restored afterward. No blocked-images banner or allow-images control appeared,
  and the rendered body contained no pixel source. Only composition requests
  reached the origin. The blocked/allow sequence is **inconclusive**, not a pass.
- Full application is merged in [PR #4](https://github.com/AssilBelhouen/mailpulse/pull/4): invited-user Auth,
  database/RLS, durable events, management API, responsive dashboard and local
  integration/browser tests. Vercel Git deployed main commit `cf834af` to production.
  Production verification passed on 2026-11-05 at 23:14 UTC (2026-11-06 at 00:14 WAT).
- Local verification passes: lint, TypeScript, 6 Node tests, 8 MIME-verifier tests,
  production build, 2 database/HTTP integration tests and 4 Playwright tests.
  Local migration reset/replay and database advisors also passed.
- Production serves the full application. Migration `20261105223639` has
  been applied to the hosted Supabase project through the connected MCP after
  local CLI replay. Hosted RLS and event-write grants match the tested schema.
  Hosted Auth settings are saved: signup and anonymous login disabled, email/password
  enabled, stable production site URL configured. The server credential is configured
  as a sensitive Vercel variable for production only and was verified by real writes.
- Live checks passed: anonymous dashboard/data protection; login and secure cookies;
  creation without loading a pixel; valid no-store transparent GIFs; HEAD without an
  event; four concurrent/sequential GETs producing exactly four events; database
  aggregates and dashboard refresh; deletion and subsequent old-token GIF; logout.
- The initial invalid credential was diagnosed through sanitized failure markers and
  Supabase's API status. A fresh Git deployment with corrected settings passed the
  full flow. Recreating an old deployment via the REST API can inherit its old
  environment; use a fresh Git deployment when validating changed project secrets.
- The temporary test account was signed out and removed along with its sessions,
  trackings and events. Its private credential file was deleted. Other accounts
  were preserved. Production verification deployment: `dpl_FjxWJdEfhfobDzgoJt5z7W4JNPbD`.
- [Quality checks passed](https://github.com/AssilBelhouen/mailpulse/actions/runs/42127741143)
  on the reviewed implementation, including migration replay, real local Auth/RLS,
  database outage handling, and the browser workflow.
- Independent whole-branch review found no blocking defects. Deferred minor:
  a failed pagination request can leave prior rows under the requested page number.
- Database access checks confirm owner isolation and server-only event writes.
  Supabase Auth reports [leaked password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection);
  invited account passwords are administered manually. Performance advisors report
  [unused indexes](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)
  on the new empty tables; the required owner/time and event/time indexes are retained.
- Public repository: https://github.com/AssilBelhouen/mailpulse
- Production origin: https://mailpulse-assil.vercel.app
- Vercel Git integration deploys protected main automatically; hosted previews are
  disabled. Main requires passing Quality checks and an up-to-date branch.
- Extra project mailpulse-ruua is retained with builds ignored and previews disabled.

No personal message headers, message contents or test-account addresses are
published. Detailed sanitized feasibility observations are in
[gmail-feasibility.md](gmail-feasibility.md). A request is an approximate signal,
never a confirmed human open or unique reader.
