import type { Metadata } from "next";
import AboutSection from "@/components/sections/AboutSection/AboutSection";
import { fetchAboutBlocks, fetchContacts } from "@/lib/contentApi";
import type { Locale } from "@/i18n";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Про нас ",
  description:
    "Дізнайтеся більше про Secret Garden — філософію, політику та послуги.",
  openGraph: {
    title: "Про нас ",
    description: "Дізнайтеся більше про Secret Garden",
    type: "website",
    locale: "uk_UA",
    siteName: "Secret Garden",
  },
};

async function getServerLocale(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get("NEXT_LOCALE")?.value;
  return raw === "en" ? "en" : "uk";
}

export default async function About() {
  const locale = await getServerLocale();
  const [blocks, contacts] = await Promise.all([
    fetchAboutBlocks(locale),
    fetchContacts(),
  ]);

  return <AboutSection blocks={blocks} contacts={contacts} />;
}
