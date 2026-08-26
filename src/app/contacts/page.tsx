import ContactsPageSection from "@/components/sections/ContactsSection/ContactsPageSection";
import { fetchContacts } from "@/lib/contentApi";
import type { Locale } from "@/i18n";
import { cookies } from "next/headers";

async function getServerLocale(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get("NEXT_LOCALE")?.value;
  return raw === "en" ? "en" : "uk";
}

export default async function ContactsPage() {
  const locale = await getServerLocale();
  const contacts = await fetchContacts(locale);
  return <ContactsPageSection contacts={contacts} />;
}
