# Gmail external-image feasibility gate

**Result: NOT YET VALIDATED.** Automated probe checks establish endpoint behavior,
not Gmail compatibility. Do not build the full application until actual evidence
below passes. No recipients or real messages belong in this public repository.

## Prepare

1. Deploy `main` to Vercel, enable public production access, disable hosted previews,
   and set `APP_ORIGIN` to the stable production HTTPS origin. Redeploy after setting it.
2. Run `npm run probe:new -- https://YOUR-PRODUCTION-HOST`. It makes no HTTP request.
   Save its `probe_id`, `pixel_url`, `fixture_url`, and HTML privately for this test.
   Generate a new token for every new message; do not reuse native/paste/DOM trials.
3. Use two accounts you control. Perform sending yourself in Gmail web. Record
   browser/version, insertion method, and times in UTC. Do not send through a tool,
   the application, SMTP automation, Gmail API, or OAuth integration.
4. Open Vercel runtime logs and filter for `mailpulse_probe_request`. Each origin
   GET emits JSON with a hashed `probe_id` and server `observed_at` timestamp.
   Match the ID returned by the generation command. Logs are temporary diagnostics,
   not a durable event database. Collect observations during the test rather than
   depending on a particular plan's log retention window.

The application logs no address, raw token, IP, UA, or request URL. Vercel may keep
its own request metadata under its provider retention policies. Use only synthetic
tokens here; do not put personal information in paths or query strings.

## Insertion methods, in order

1. **Native Gmail UI:** use the compose image toolbar's web-address/URL option if
   available. Supply `pixel_url`. Insert as an inline image rather than a file
   attachment, upload, Drive image, hyperlink, or visible plain URL. Record whether
   this option is available in the tested Gmail UI.
2. **Rendered paste:** open `fixture_url`. This intentionally loads the image at
   the origin; record that baseline request. Select the test paragraph and its
   invisible image, copy, and paste into Gmail. Check the draft's image element
   in browser developer tools to confirm an image was included in the selection.
   Pasting literal `<img ...>` text into Gmail does not insert an image.
3. **Manual DOM:** in browser developer tools' Elements panel, locate the current
   draft body, edit its HTML, and append the generated image element. Confirm Gmail
   saves the draft. This is a manual browser workaround, not a supported Gmail API.

For each method, inspect the **received original message**, not just the rendered
Gmail DOM. A proxy URL visible in the DOM does not establish what was sent.

## Controlled observations for each message

| Stage | Record |
| --- | --- |
| Before insertion | Baseline timestamps for this fresh probe ID. |
| Insertion/composition | Any requests caused by UI previews or loading the fixture. |
| Delivery before recipient viewing | Requests caused by scanning or prefetching. |
| Recipient opens with external images blocked | Actual requests, including if there are none. |
| Recipient chooses to display external images | Origin requests after the controlled display action. |
| Recipient reopens with images allowed | Whether additional requests occur; caching may suppress them. |

Set the recipient's external-image preference before delivery for the blocked trial.
Do not open the sender's Sent copy before collecting recipient observations; that
could add requests or warm proxy caches. Note any accidental sender/fixture views.
Keep observation times with timezone offsets; convert to UTC to compare logs.

## Inspect the received MIME locally

Download the received message as `.eml` using Gmail's message menu. Keep it outside
the repository. The file contains personal headers and message content.

```bash
npm run probe:verify -- /absolute/private/path/message.eml https://YOUR-HOST/api/pixel/TOKEN
```

The checker decodes MIME transfer encodings and checks HTML body image `src`
attributes for the exact original HTTPS URL. It excludes HTML attachments and
forwarded messages. It prints only preservation/count summary, never the message.
Exit 0 means the URL survives; exit 1 means it did not match; exit 2 means the input
or inspection failed. A matching URL is only one half of the gate.

## Pass, fail, or inconclusive

**Pass only when both are demonstrated:**

- A repeatable manual insertion method preserves the original HTTPS image URL in
  the received HTML, rather than `cid:`, `data:`, or a rehosted image.
- Controlled recipient image loading reaches the origin. Composition-only,
  fixture-only, scanner-only, or unexplained requests do not prove this.

Repeat the successful method with at least two fresh messages/tokens. Record all
stages and repeat-open/cache behavior. Additional reopen requests are not required.
If native insertion fails, try the next method with a fresh token. If every method
fails, stop and document the limitation. If cache warming prevents attribution,
mark the trial inconclusive; do not label it a pass or invent a workaround result.

Keep a private observation record in this shape (no email addresses needed):

```text
Browser/version:
Method:
Trial number / probe ID:
Insertion and delivery UTC times:
Blocked-open / image-display / reopen UTC times:
Observed origin timestamps by stage:
MIME preservation checker result:
Sender/fixture views or other confounders:
Outcome: pass / fail / inconclusive
```

After evidence is reviewed, update `docs/status.md` with a sanitized result and
only then implement the dashboard and database. Never publish real `.eml` files,
addresses, or private log exports.
