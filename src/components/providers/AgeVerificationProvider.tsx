"use client";

import { useEffect } from "react";
import AgeVerificationModal, {
  AgeBlockedScreen,
} from "@/components/age/AgeVerificationModal";
import { useAgeVerificationStore } from "@/store/ageVerification";

export default function AgeVerificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useAgeVerificationStore((state) => state.hydrated);
  const status = useAgeVerificationStore((state) => state.status);
  const init = useAgeVerificationStore((state) => state.init);

  useEffect(() => {
    void init();
  }, [init]);

  if (!hydrated) {
    return <>{children}</>;
  }

  if (status === false) {
    return <AgeBlockedScreen />;
  }

  return (
    <>
      {children}
      {status === null ? <AgeVerificationModal /> : null}
    </>
  );
}
