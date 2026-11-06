import Image from "next/image";

export function Brand({ version = false }: { version?: boolean }) {
  return <span className="inline-flex shrink-0 items-center gap-3 text-xl font-semibold tracking-tight text-primary">
    <Image src="/logo.svg" alt="" width={36} height={36} />
    <span>MailPulse{version && <span className="ml-2 text-xs font-normal text-muted-foreground">V0</span>}</span>
  </span>;
}
