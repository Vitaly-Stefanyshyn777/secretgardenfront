import type { Metadata } from "next";
import PrivacyPolicySection from "@/components/sections/PrivacyPolicySection/PrivacyPolicySection";

export const metadata: Metadata = {
  title: "Політика конфіденційності - BFB",
  description: "Політика конфіденційності BFB. Як ми збираємо, використовуємо та захищаємо вашу персональну інформацію.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicySection />;
}
