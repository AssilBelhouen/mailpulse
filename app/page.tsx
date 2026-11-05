export default function Home() {
  return (
    <main>
      <h1>MailPulse Gmail feasibility probe</h1>
      <p>Gmail feasibility has not yet been validated.</p>
      <p>This deployment serves synthetic tracking pixels so we can test whether Gmail preserves externally hosted images.</p>
      <p>It does not store recipient addresses or provide a dashboard.</p>
      <p>Generate a test with <code>npm run probe:new -- YOUR_HTTPS_ORIGIN</code>, then follow <code>docs/gmail-feasibility.md</code> in the repository.</p>
      <p>Image requests can come from composition, senders, scanners, or proxies. They do not confirm a human opened an email.</p>
    </main>
  );
}
