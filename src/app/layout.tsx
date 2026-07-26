import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { Suspense } from "react";
import { Golos_Text } from "next/font/google";
import { Inter_Tight } from "next/font/google";
import { Manrope } from "next/font/google";
import { Montserrat } from "next/font/google";
import { Inter } from "next/font/google";
import { Roboto } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeSettingsProvider } from "@/components/providers/ThemeSettingsProvider";
import AnchorHandler from "@/components/layout/AnchorHandler/AnchorHandler";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  description: "Навчання, інвентар та тренування",
  // icons: {
  //   icon: "/favicon.svg",
  //   shortcut: "/favicon.svg",
  //   apple: "/apple-icon.svg",
  // },
};

const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos-text",
  display: "swap",
  preload: true, // Preload для основного шрифту
});
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  preload: true, // Основний шрифт - preload
});
const manrope = Manrope({
  subsets: ["cyrillic"],
  display: "swap",
  preload: false, // Preload тільки якщо використовується одразу
});
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto",
  display: "swap",
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uk"
      className={`${golosText.className} ${interTight.className} ${manrope.className} ${montserrat.variable} ${inter.variable} ${roboto.variable}`}
    >
      <body>
        <QueryProvider>
          <AuthProvider>
            <ThemeSettingsProvider>
              <AnchorHandler />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <Header />
              <Suspense fallback={null}>
                <Breadcrumbs />
              </Suspense>
              <main>{children}</main>
              <Footer />
            </ThemeSettingsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
