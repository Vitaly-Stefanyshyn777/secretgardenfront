import type { Metadata } from "next";
import AboutSection from "@/components/sections/AboutSection/AboutSection";

export const metadata: Metadata = {
  title: "Про нас ",
  description:
    "Дізнайтеся більше про BFB - школу фітнесу, тренувань та навчання. Наша місія та цінності.",
  openGraph: {
    title: "Про нас ",
    description: "Дізнайтеся більше про BFB - школу фітнесу та тренувань",
    type: "website",
    locale: "uk_UA",
    siteName: "",
  },
};

export default function About() {
  return <AboutSection />;
}
