import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакти - BFB",
  description: "Зв'яжіться з BFB. Наша адреса, телефон, email та графік роботи. Ми завжди на зв'язку!",
  openGraph: {
    title: "Контакти - BFB",
    description: "Зв'яжіться з BFB - адреса, телефон, email",
    type: "website",
    locale: "uk_UA",
    siteName: "BFB",
  },
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
