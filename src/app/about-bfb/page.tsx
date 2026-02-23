import type { Metadata } from "next";
import AboutBFBSection from "@/components/sections/AboutBFBSection/AboutBFBSection";

export const metadata: Metadata = {
  title: "Про BFB - BFB",
  description: "Дізнайтеся більше про BFB - методику тренувань, історію та наш підхід до навчання.",
  openGraph: {
    title: "Про BFB - BFB",
    description: "Дізнайтеся більше про BFB - методику тренувань та навчання",
    type: "website",
    locale: "uk_UA",
    siteName: "BFB",
  },
};

export default function AboutBFBPage() {
  return <AboutBFBSection />;
}

