import ContactsPageSection from "@/components/sections/ContactsSection/ContactsPageSection";
import { fetchContacts } from "@/lib/contentApi";

export default async function ContactsV2Page() {
  const contacts = await fetchContacts();
  return <ContactsPageSection contacts={contacts} />;
}
