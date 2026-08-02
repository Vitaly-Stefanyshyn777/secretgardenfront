import { DEFAULT_ABOUT_BLOCKS } from "@/config/aboutBlocks";

const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api`;

export type ContentBanner = {
  id: string;
  title: string;
  titleSub?: string | null;
  description: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  order: number;
};

export type ContentAboutLink = {
  label: string;
  url: string;
  kind?: string;
};

export type ContentAboutBlock = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  imageLeft: boolean;
  ctaLabel: string | null;
  ctaUrl: string | null;
  links: ContentAboutLink[] | null;
  order: number;
};

export type ContentContacts = {
  introTitle: string;
  introText: string;
  scheduleTitle: string;
  hoursTime: string;
  daysOff: string;
  holidayNote?: string | null;
  address: string;
  email: string;
  instagramUrl: string;
  instagramLabel?: string | null;
  telegramUrls: string[];
  telegramLabels?: string[] | null;
  mapSrc: string;
  venuePhotoUrl?: string | null;
  certificateUrl?: string | null;
  donationUrl?: string | null;
};

export async function fetchPublicContent() {
  const res = await fetch(`${BASE}/content`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("content fetch failed");
  return res.json() as Promise<{
    banners: ContentBanner[];
    aboutBlocks: ContentAboutBlock[];
    contacts: ContentContacts;
    venuePhotos: Array<{ id: string; imageUrl: string; title?: string | null }>;
  }>;
}

export async function fetchBanners(): Promise<ContentBanner[]> {
  try {
    const res = await fetch(`${BASE}/content/banners`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchAboutBlocks(): Promise<ContentAboutBlock[]> {
  try {
    const res = await fetch(`${BASE}/content/about`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return DEFAULT_ABOUT_BLOCKS;
    const data = (await res.json()) as ContentAboutBlock[];
    return Array.isArray(data) && data.length > 0
      ? data
      : DEFAULT_ABOUT_BLOCKS;
  } catch {
    return DEFAULT_ABOUT_BLOCKS;
  }
}

export async function fetchContacts(): Promise<ContentContacts | null> {
  try {
    const res = await fetch(`${BASE}/content/contacts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
