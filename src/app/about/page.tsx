import type { Metadata } from "next";
import AboutSection from "@/components/sections/AboutSection/AboutSection";
import { fetchAboutBlocks, fetchContacts } from "@/lib/contentApi";

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

export default async function About() {
  const [blocks, contacts] = await Promise.all([
    fetchAboutBlocks(),
    fetchContacts(),
  ]);

  return <AboutSection blocks={blocks} contacts={contacts} />;
}
