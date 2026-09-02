"use client";

import { create } from "zustand";
import {
  fetchUserAgeVerified,
  readAgeVerifiedFromStorage,
  saveUserAgeVerified,
  writeAgeVerifiedToStorage,
  type AgeVerificationStatus,
} from "@/lib/ageVerification";
import { useAuthStore } from "@/store/auth";

interface AgeVerificationState {
  status: AgeVerificationStatus;
  hydrated: boolean;
  init: () => Promise<void>;
  confirm: (verified: boolean) => Promise<void>;
}

export const useAgeVerificationStore = create<AgeVerificationState>((set) => ({
  status: null,
  hydrated: false,

  init: async () => {
    let status = readAgeVerifiedFromStorage();
    const token = useAuthStore.getState().token;

    if (token) {
      const fromDb = await fetchUserAgeVerified(token);
      if (fromDb !== null) {
        status = fromDb;
        writeAgeVerifiedToStorage(fromDb);
      } else if (status !== null) {
        await saveUserAgeVerified(token, status);
      }
    }

    set({ status, hydrated: true });
  },

  confirm: async (verified: boolean) => {
    writeAgeVerifiedToStorage(verified);
    set({ status: verified });

    const token = useAuthStore.getState().token;
    if (token) {
      try {
        await saveUserAgeVerified(token, verified);
      } catch {
        /* localStorage залишається джерелом правди для гостя */
      }
    }
  },
}));

export async function syncAgeVerificationAfterAuth(token: string): Promise<void> {
  const local = readAgeVerifiedFromStorage();
  const fromDb = await fetchUserAgeVerified(token);

  if (fromDb !== null) {
    writeAgeVerifiedToStorage(fromDb);
    useAgeVerificationStore.setState({ status: fromDb, hydrated: true });
    return;
  }

  if (local !== null) {
    try {
      await saveUserAgeVerified(token, local);
    } catch {
      /* ignore */
    }
    useAgeVerificationStore.setState({ status: local, hydrated: true });
  }
}
