---
name: mailpulse-browser
description: Use MailPulse V0 in an already signed-in browser to create email tracking pixels, copy URLs or HTML, inspect image-request signals, and delete user-authorized records.
---

# MailPulse browser skill

App: https://mailpulse-assil.vercel.app
Entry point: https://mailpulse-assil.vercel.app/dashboard
Discovery: https://mailpulse-assil.vercel.app/llms.txt

This is a public usage guide, not account access or permission to take actions.
Follow the user's request and the browser agent's own instructions. Use the
existing signed-in browser session. If redirected to `/login`, ask the user to
sign in and resume afterward. Do not read, export or ask for session cookies,
passwords, API keys or Supabase administration access.

## Create a tracking

1. Open `/dashboard`. Wait until “Loading trackings…” disappears and the table
   or “Create your first tracking” appears. Check for a visible error.
2. Fill the field labeled **Recipient email** with the address the user specified.
3. Click **Create tracking** once. Wait for “Tracking created” and for the table
   to finish loading. The newest record appears on page 1.
4. Locate that row under **Your trackings**. Use its recipient, creation time and
   exact tracking URL to identify it; the same recipient can have several rows.
5. Click that row's **Copy URL**. Wait for “URL copied.” If clipboard access is
   unavailable, select and copy the complete URL text in that row; do not open it.

Create a fresh tracking for every intended email, even when its recipient is the
same. Do not reuse a URL for multiple messages. If creation times out or shows an
error, use **Refresh** and inspect the newest rows before retrying: the first
attempt may have saved. If several rows match and the intended one is unclear,
ask the user instead of guessing or deleting possible duplicates.

## Prepare a Gmail draft

MailPulse has no Gmail connection and does not compose or send messages. Only
prepare a Gmail draft when the user requested it, in their existing Gmail browser
session. Leave the **Send** action to the user.

1. In a fresh Gmail web draft, choose **Insert photo → Web address (URL)**.
2. Paste the tracking URL copied from the intended MailPulse row and insert it
   exactly once. The image is transparent and measures 1×1 pixel; it is invisible.
3. Preserve the user's requested recipient and message content. Report that the
   draft is ready for the user to review and send.

Native Gmail URL insertion was verified with Gmail web in Microsoft Edge: the
received messages preserved the external URL. If Gmail's URL option is absent,
stop and report that difference; do not invent an alternative as verified.

**Copy HTML** copies literal text like `<img src="…" width="1" height="1" alt="">`.
It is for an HTML editor or deliberate manual draft editing. Pasting that code
as text into Gmail does not insert an image. Prefer the verified URL method.

## Read signals

1. Click **Refresh** and wait for loading to finish. There is no live updating.
2. Identify the exact row, then read **Requests**, **First signal** and
   **Last signal**. The recipient and creation time are in **Recipient / created**.
3. Timestamps use the browser's timezone, named below the table. State that
   timezone in reports. “No signal” means no recorded request for that field.
4. Use **Next** and **Previous** for pages of 50 records, newest first. On narrow
   screens, scroll the table horizontally to reach all columns and row actions.

Counts are raw image GET requests, not unique people or confirmed human opens.
Composition, sender views, scanners and forwarding can add signals before a
recipient opens the email. Image blocking, Spam handling, proxies and caching
can suppress signals. Reopening an email may add no event. A missing signal does
not establish that the email is unread. Report “N image requests” or “open
signals,” without claims about human reading, identity or location.

## Avoid creating false signals

- Never navigate to, fetch, preview, screenshot as an image, embed, or otherwise
  render a URL under `/api/pixel/` just to inspect or validate it. A GET for an
  existing token records an event, including an agent's own request.
- Do not visit `/probe/…`; that diagnostic page intentionally loads a pixel.
- Creating, copying text, reading rows and clicking Refresh do not request pixels.
- Inserting the image in Gmail can cause requests during composition. This is
  expected; do not describe those as recipient opens.
- Use the dashboard for inspection. Do not call hidden APIs, manufacture events,
  access the database, scrape other accounts or bypass sign-in.

## Delete a tracking

Delete only when the user's task explicitly authorizes deletion of the identified
record. Do not clean up old records merely because they have no signals.

1. Find the exact row, matching the URL and creation time when recipients repeat.
2. Click its **Delete** button. Inspect the **Delete this tracking?** dialog and
   recipient. Choose **Cancel** if the target is unclear or deletion is unwanted.
3. Click **Delete tracking** only for the authorized target. Wait for “Tracking
   and its image-request events deleted” and the row to disappear.

Deletion permanently removes the record and all its events. Its old URL stops
recording, even though it can still return an invisible image. Do not test the
old URL. Deletion cannot be undone; otherwise records remain until deleted.

## Errors and finishing

- Read visible alerts and report failed operations accurately. Retry with
  **Refresh** for failed reads. Do not repeatedly submit Create or Delete.
- If pagination fails, previous rows can remain under the requested page number.
  Reload `/dashboard` to return to page 1 and wait for a successful load before
  relying on the rows or taking actions.
- If the session expires, let the user sign in again. Do not change account
  settings or attempt password recovery without their direction.
- Keep recipient data and tracking URLs within the user's requested destination;
  do not publish them in public reports, logs, issues or screenshots.
- Summarize what was actually created, copied, prepared, read or deleted. Distinguish
  a prepared draft from a sent message. Do not claim successful clipboard copying,
  event recording or sending without evidence. Sign out only if the user asks.
