/* eslint-disable @next/next/no-img-element -- The test must preserve the original remote image; no optimizer. */
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProbeFixture({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) notFound();
  let origin: URL;
  try {
    origin = new URL(process.env.APP_ORIGIN ?? "");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if ((origin.protocol !== "https:" && !(origin.protocol === "http:" && local)) ||
        origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) throw new Error();
  } catch {
    return <main><h1>Probe fixture requires configuration</h1><p>Set APP_ORIGIN to this deployment’s stable HTTPS origin, then redeploy.</p></main>;
  }
  const pixelUrl = `${origin.origin}/api/pixel/${token}`;
  return (
    <main>
      <h1>Rendered-image paste fixture</h1>
      <p>Opening this page intentionally requests the pixel. Record that baseline before sending.</p>
      <p>Select and copy only the following test paragraph, including the invisible image at its end, then paste into a Gmail draft.</p>
      <div id="email-fragment"><p>MailPulse synthetic feasibility test.<img src={pixelUrl} width="1" height="1" alt="" /></p></div>
      <p>Use the received message source and origin logs to verify preservation. This page alone does not prove Gmail compatibility.</p>
    </main>
  );
}
