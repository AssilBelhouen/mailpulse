# Implementation status

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
- Full application is implemented in [draft PR #4](https://github.com/AssilBelhouen/mailpulse/pull/4): invited-user Auth,
  database/RLS, durable events, management API, responsive dashboard and local
  integration/browser tests. Production release is pending review and hosted setup.
- Local verification passes: lint, TypeScript, 6 Node tests, 8 MIME-verifier tests,
  production build, 2 database/HTTP integration tests and 4 Playwright tests.
  Local migration reset/replay and database advisors also passed.
- Production still serves the feasibility probe. Migration `20261105223639` has
  been applied to the hosted Supabase project through the connected MCP after
  local CLI replay. Hosted RLS and event-write grants match the tested schema.
  Hosted Auth settings are saved: signup and anonymous login disabled, email/password
  enabled, stable production site URL configured. The browser agent has paused for
  action-time confirmation on the server-only Vercel secret and temporary smoke account.
- [Quality checks passed](https://github.com/AssilBelhouen/mailpulse/actions/runs/42123258943)
  on the reviewed implementation, including migration replay, real local Auth/RLS,
  database outage handling, and the browser workflow.
- Independent whole-branch review found no blocking defects. Deferred minor:
  a failed pagination request can leave prior rows under the requested page number.
- Hosted security advisors report no findings. Performance advisors report only
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
