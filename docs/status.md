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
- Full application is implemented on the feature branch: invited-user Auth,
  database/RLS, durable events, management API, responsive dashboard and local
  integration/browser tests. Production release is pending review and hosted setup.
- Local verification passes: lint, TypeScript, 6 Node tests, 8 MIME-verifier tests,
  production build, 2 database/HTTP integration tests and 4 Playwright tests.
  Local migration reset/replay and database advisors also passed.
- Production still serves the feasibility probe. No application migration has yet
  been applied to the hosted Supabase project. Hosted Auth settings and the
  server-only Vercel secret require authenticated dashboard access.
- Public repository: https://github.com/AssilBelhouen/mailpulse
- Production origin: https://mailpulse-assil.vercel.app
- Vercel Git integration deploys protected main automatically; hosted previews are
  disabled. Main requires passing Quality checks and an up-to-date branch.
- Extra project mailpulse-ruua is retained with builds ignored and previews disabled.

No personal message headers, message contents or test-account addresses are
published. Detailed sanitized feasibility observations are in
[gmail-feasibility.md](gmail-feasibility.md). A request is an approximate signal,
never a confirmed human open or unique reader.
