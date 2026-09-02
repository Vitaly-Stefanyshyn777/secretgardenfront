export const AGE_VERIFIED_STORAGE_KEY = "sg_age_verified";

export type AgeVerificationStatus = boolean | null;

export function readAgeVerifiedFromStorage(): AgeVerificationStatus {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AGE_VERIFIED_STORAGE_KEY);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

export function writeAgeVerifiedToStorage(verified: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AGE_VERIFIED_STORAGE_KEY, String(verified));
}

export function getAgeVerificationHeaderValue(): string | undefined {
  const status = readAgeVerifiedFromStorage();
  if (status === true) return "true";
  if (status === false) return "false";
  return undefined;
}

export function getAgeVerificationHeaders(): Record<string, string> {
  const value = getAgeVerificationHeaderValue();
  return value ? { "x-age-verified": value } : {};
}

export async function fetchUserAgeVerified(
  token: string,
): Promise<AgeVerificationStatus> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  if (!base || !token) return null;

  try {
    const res = await fetch(`${base}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const me = (await res.json()) as { ageVerified?: boolean | null };
    if (me.ageVerified === true) return true;
    if (me.ageVerified === false) return false;
    return null;
  } catch {
    return null;
  }
}

export async function saveUserAgeVerified(
  token: string,
  verified: boolean,
): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  if (!base || !token) return;

  await fetch(`${base}/api/user/age-verification`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verified }),
  });
}
