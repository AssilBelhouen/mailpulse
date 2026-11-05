# Implementation status

- Gmail feasibility: **not yet validated**.
- Task 1: probe deployed and verified over public HTTPS. Real Gmail evidence is
  still pending; the feasibility gate has not passed.
- Tasks 2–3: pending the Gmail feasibility gate. Task 4's repository, CI, branch
  protection, and Vercel Git deployment are configured; full-app release checks remain pending.
- This implementation has made no production Supabase changes.
- Public GitHub repository: https://github.com/AssilBelhouen/mailpulse
- Vercel authentication restored. Project `mailpulse` created in team `assil` with
  Node 22.x, public access, and previews disabled.
- Live probe: https://mailpulse-assil.vercel.app
- Vercel GitHub integration now lists `mailpulse` linked to `AssilBelhouen/mailpulse`.
- First production deployment: `dpl_GqKkWZzhh9zDmHn8EwnnmFdX9Yob`, automatically
  deployed from `main` commit `f5ceb12e2efa76365072f6aea5bd09afeafade0b`.
- Main branch protection requires passing `Quality checks` and an up-to-date PR branch.
- Automated evidence: 5 Node tests, 8 Python MIME-verifier tests, 3 Playwright
  tests; lint, typecheck, and production build pass. This is not Gmail evidence.
- Independent review found a MIME-body false positive. Regression tests now cover
  named attachments, unused related resources, alternative selection, duplicate image
  sources, and inert HTML; the verifier selects the message body before inspection.
- GitHub checks passed for the reviewed PR and production main:
  https://github.com/AssilBelhouen/mailpulse/actions/runs/42107283965
- Public smoke verification: HEAD 200 with no body; two GETs returned transparent
  GIFs with no cookies/ETag and `x-vercel-cache: MISS`. Chromium loaded the fixture's
  absolute production-origin image. The origin logs contain exactly three synthetic
  signals for those two GETs plus the browser image load; HEAD emitted none.
- The extra user-created Vercel project `mailpulse-ruua` is retained, with previews
  disabled and builds ignored to prevent duplicate deployments.
- Separate loading control: a connector-sent test was opened in Outlook web and
  produced one origin image request. This does not validate manual Gmail insertion
  or establish a confirmed human open.
- Manual trial 1 used Gmail web's native Insert photo → Web address option, with
  Outlook web as the recipient client in Microsoft Edge. The supplied received MIME
  passed the local preservation checker: the exact external HTTPS image URL survived.
  The HTML contained two 1×1 image elements using that URL; the next trial must insert
  only one. No message contents or personal headers are retained in this repository.
- Trial 1 produced three origin requests before the recipient opened the message
  (2026-11-05 at 21:02:10.543, 21:02:12.408, and 21:02:29.236 UTC), followed by one
  new request at 21:03:37.169 UTC after the tester opened it with images allowed.
  Pre-opening requests cannot be attributed more precisely to composition or delivery.
  This supports recipient loading, but does not establish unique or human opens.
- Feasibility remains pending a fresh-message repeat and blocked-image/repeated-open
  observations. The browser was reported as Microsoft Edge; its version was not
  recorded. Trial 1 alone is not a gate pass.
- Next: follow `docs/gmail-feasibility.md`, inspect received MIME locally, correlate
  controlled recipient image display with logs, and repeat with a fresh token.
