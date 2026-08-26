"use client";

import { useTranslation } from "@/hooks/useTranslation";
import PrivacyPolicyEn from "./PrivacyPolicyEn";
import PrivacyPolicyUk from "./PrivacyPolicyUk";

export default function PrivacyPolicySection() {
  const { locale } = useTranslation();
  return locale === "en" ? <PrivacyPolicyEn /> : <PrivacyPolicyUk />;
}
