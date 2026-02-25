import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginApi, getMyProfile } from "@/lib/auth";
import { useCartStore } from "./cart";
import { useFavoriteStore } from "./favorites";

const initial = {
  token: null,
  user: null,
  isLoggedIn: false,
  isHydrated: false,
};

export interface AuthUser {
  id?: string;
  email?: string;
  nicename?: string;
  displayName?: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  isLoginModalOpen: boolean;
  setAuth: (token: string, user?: AuthUser | null) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
  checkTokenValidity: () => Promise<boolean>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

function saveTokenToStorage(token: string) {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("bfb_token", token);
    localStorage.setItem("bfb_token_old", token);
  }
}

function loadUserData(userId: string) {
  const cartStore = useCartStore.getState();
  const favoriteStore = useFavoriteStore.getState();

  const tokenInStorage =
    typeof window !== "undefined" &&
    (localStorage.getItem("bfb_token") ||
      localStorage.getItem("bfb_token_old"));

  if (!tokenInStorage) return;

  setTimeout(async () => {
    try {
      await cartStore.loadUserData(userId);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await favoriteStore.loadUserData(userId);
    } catch (err) {
      // Silently handle errors
    }
  }, 200);
}

// Функція для синхронізації даних після авторизації
function syncUserDataAfterLogin(userId: string) {
  // Використовуємо setTimeout щоб дати час на ініціалізацію компонентів
  setTimeout(async () => {
    try {
      // Динамічно імпортуємо stores щоб уникнути циклічних залежностей
      const { useCartStore } = await import("./cart");
      const { useFavoriteStore } = await import("./favorites");

      const cartStore = useCartStore.getState();
      const favoriteStore = useFavoriteStore.getState();

      // Встановлюємо ID користувача
      cartStore.setUserId(userId);
      favoriteStore.setUserId(userId);

      // Очищаємо старі дані та завантажуємо нові
      cartStore.clear();
      favoriteStore.clear();

      await cartStore.loadUserData(userId);
      await favoriteStore.loadUserData(userId);
    } catch (err) {
      console.error("Error syncing user data after login:", err);
    }
  }, 500); // Трохи більше часу для ініціалізації
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: initial.user,
      token: initial.token,
      isLoggedIn: initial.isLoggedIn,
      isHydrated: initial.isHydrated,
      isLoginModalOpen: false,

      setAuth: (token: string, user: AuthUser | null = null) => {
        saveTokenToStorage(token);
        set({ token, user, isLoggedIn: true });

        if (user?.id) {
          loadUserData(user.id);
        }
      },

      setUser: (user: AuthUser | null) => {
        set({ user });
      },

      clear: () => {
        set({ token: null, user: null, isLoggedIn: false });
      },

      initAuth: () => {
        set({ isHydrated: true });
      },

      checkTokenValidity: async () => {
        const { token, user } = get();

        if (!token) {
          return false;
        }

        // Тимчасово вважаємо токен валідним без перевірки на старому WP‑бекенді.
        // Дані користувача вже встановлені через setAuth (Node бекенд).
        set({ isLoggedIn: true, user });
        saveTokenToStorage(token);

        if (user?.id) {
          loadUserData(user.id);
          syncUserDataAfterLogin(user.id);
        }

        return true;
      },

      login: async (credentials) => {
        try {
          const data = await loginApi(credentials);

          if (typeof window !== "undefined" && data.token) {
            saveTokenToStorage(data.token);
            await fetch("/api/set-user-cookie", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: data.token }),
            }).catch(() => {});
          }

          const user = {
            id: data.user_nicename,
            email: data.user_email,
            displayName: data.user_display_name,
          };

          set({ user, token: data.token, isLoggedIn: true });

          let numericId: string | undefined;
          try {
            const me = await getMyProfile(data.token);
            if (me?.id) {
              numericId = String(me.id);
              set({ user: { ...user, id: numericId } });
            }
          } catch {}

          const finalUserId = numericId || user.id;
          if (finalUserId) {
            loadUserData(finalUserId);
            // Синхронізуємо кошик після авторизації
            syncUserDataAfterLogin(finalUserId);
          }
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        const { user } = get();
        const userId = user?.id;

        const cartStore = useCartStore.getState();
        const favoriteStore = useFavoriteStore.getState();

        cartStore.close();
        favoriteStore.close();

        if (userId) {
          cartStore.setUserId(userId);
          favoriteStore.setUserId(userId);
        }

        cartStore.loadUserData(null).catch(() => {});
        favoriteStore.loadUserData(null).catch(() => {});

        set({ user: null, token: null, isLoggedIn: false });

        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("bfb_token");
            localStorage.removeItem("bfb_token_old");
            localStorage.removeItem("wp_jwt");
            localStorage.removeItem("wp_jwt_override");
            localStorage.removeItem("bfb-auth");
            localStorage.removeItem("bfb_user");
            localStorage.removeItem("trainer_certificates_preview");
            localStorage.removeItem("orderData");
            localStorage.removeItem("userLocationConfirmed");
            localStorage.removeItem("userLocation");
          } catch (error) {}
        }

        try {
          await fetch("/api/set-user-cookie", { method: "DELETE" });
        } catch {}
      },

      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
    }),
    {
      name: "bfb-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem("bfb_token", state.token);
        }
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
