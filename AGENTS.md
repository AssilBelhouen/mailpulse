# MailPulse working instructions

- Next.js App Router and TypeScript, npm with a committed lockfile, Vercel hosting.
- Read `docs/plan.md` and `docs/gmail-feasibility.md` before implementation.
- Do not implement the dashboard or change production Supabase until the Gmail
  feasibility gate has recorded real passing evidence. Do not invent results.
- Never use Gmail API, OAuth, programmatic email sending, or a browser extension.
- Never commit real messages, recipient addresses, credentials, or test traces
  containing personal data. Use synthetic addresses and random tokens in tests.
- The public pixel must never require authentication, set cookies, or be cached.
- Keep application logs free of recipient addresses, raw URLs/tokens, IPs, and UAs.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and
  `npm run test:e2e` before delivery. Run the Python verifier tests too.
- Keep `docs/status.md` factual about completed work and remaining gates.
