export const PUBLIC_DOMAINS = new Set<string>([
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "hotmail.com",
  "live.com",
  "aol.com",
]);

export function isPublicDomain(domain: string | null | undefined): boolean {
  if (!domain) return false;
  return PUBLIC_DOMAINS.has(domain.toLowerCase());
}


