"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import {
  loginNode,
  signupNode,
  refreshNode,
  type LoginPayload,
  type SignupPayload,
  type AuthTokens,
} from "./nodeAuth";

const REFRESH_TOKEN_KEY = "bfb_refresh_token";

function saveRefreshToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
}

function saveTokenToStorage(token: string) {
  if (typeof window === "undefined" || !token) return;
  try {
    localStorage.setItem("bfb_token", token);
    localStorage.setItem("bfb_token_old", token);
    localStorage.setItem("accessToken", token);
  } catch {}
}

export const useNodeLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginNode(payload),
    onSuccess: async (tokens: AuthTokens, variables: LoginPayload) => {
      saveRefreshToken(tokens.refreshToken);
      saveTokenToStorage(tokens.accessToken);

      const email = variables.email || variables.phone || "";
      let user: { id?: string; email?: string; displayName?: string } = {
        id: email,
        email: variables.email,
        displayName: email,
      };

      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
        const res = await fetch(`${base}/api/user/me`, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        if (res.ok) {
          const me = (await res.json()) as { id?: string | number };
          if (me?.id != null) {
            user = { ...user, id: String(me.id) };
          }
        }
      } catch {
        // залишаємо id: email як fallback
      }

      setAuth(tokens.accessToken, user);
    },
  });
};

export const useNodeRegister = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (payload: SignupPayload) => signupNode(payload),
    onSuccess: (tokens: AuthTokens, variables: SignupPayload) => {
      saveRefreshToken(tokens.refreshToken);

      const displayName =
        `${variables.firstname} ${variables.lastname}`.trim() ||
        variables.email;

      const user = {
        email: variables.email,
        displayName,
      };

      setAuth(tokens.accessToken, user);
    },
  });
};

export const useNodeRefresh = () => {
  const { setAuth, user } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (typeof window === "undefined") {
        throw new Error("Refresh token is not available");
      }
      const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!stored) {
        throw new Error("Refresh token is missing");
      }
      return refreshNode(stored);
    },
    onSuccess: (tokens: AuthTokens) => {
      saveRefreshToken(tokens.refreshToken);
      setAuth(tokens.accessToken, user);
    },
  });
};

