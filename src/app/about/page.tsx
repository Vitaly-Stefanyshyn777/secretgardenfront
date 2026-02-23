import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про нас - BFB",
  description: "Дізнайтеся більше про BFB - школу фітнесу, тренувань та навчання. Наша місія та цінності.",
  openGraph: {
    title: "Про нас - BFB",
    description: "Дізнайтеся більше про BFB - школу фітнесу та тренувань",
    type: "website",
    locale: "uk_UA",
    siteName: "BFB",
  },
};

export default function About() {
  return <div>About</div>;
}
