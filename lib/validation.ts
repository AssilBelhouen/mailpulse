export function publicOrigin(value: string | undefined): string {
  if (!value) throw new Error("APP_ORIGIN is required");
  const url = new URL(value);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname)))) {
    throw new Error("APP_ORIGIN must be an HTTPS origin (HTTP loopback is allowed locally)");
  }
  return url.origin;
}

export function sameOrigin(request: Request, origin: string): boolean {
  return request.headers.get("origin") === origin && request.headers.get("sec-fetch-site") !== "cross-site";
}

export function emailAddress(value: unknown): string {
  if (typeof value !== "string" || /[\r\n\x00-\x1f\x7f]/.test(value)) throw new Error("Enter a valid recipient email address.");
  const email = value.trim();
  if (email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/.test(email) || email.split("@")[0].length > 64 || email.includes("..")) {
    throw new Error("Enter a valid recipient email address.");
  }
  return email;
}

export function pageNumber(value: string | null): number {
  if (value === null) return 1;
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 100000) throw new Error("Invalid page.");
  return Number(value);
}

export function validId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
