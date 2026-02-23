import type { Metadata } from "next";
import ContractSection from "@/components/sections/ContractSection/ContractSection";

export const metadata: Metadata = {
  title: "Договір публічної оферти - BFB",
  description: "Договір публічної оферти BFB. Умови надання послуг та правил користування платформою.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function OfertaPage() {
  return <ContractSection />;
}
