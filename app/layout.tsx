import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MailPulse — Gmail feasibility probe",
  description: "Synthetic external-image preservation test. Full application pending validation.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
