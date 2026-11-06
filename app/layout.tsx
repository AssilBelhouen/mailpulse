import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MailPulse — email image requests",
  description: "A simple, private dashboard for email image-request signals.",
  icons: { icon: [{ url: "/logo.svg", type: "image/svg+xml", sizes: "any" }] },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><head><link rel="describedby" href="/llms.txt" type="text/plain" /></head><body>{children}</body></html>;
}
