import axios, { type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token =
      localStorage.getItem("bfb_token") ||
      localStorage.getItem("bfb_token_old");
  }

  const isJwtTokenEndpoint = (config.url || "").includes(
    "/wp-json/jwt-auth/v1/token"
  );

  const wantsAdmin =
    !!config.headers &&
    ((config.headers as unknown as Record<string, string>)[
      "x-internal-admin"
    ] === "1" ||
      (config.headers as unknown as Record<string, string>)[
        "X-Internal-Admin"
      ] === "1");

  const isCartOrWishlist = 
    config.url?.includes("/api/cart") || 
    config.url?.includes("/api/wishlist");

  if (!isJwtTokenEndpoint && config.headers && !wantsAdmin) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Без автоматичного admin-login та ретраю через WP
    return Promise.reject(error);
  },
);

export default api;

export type RequestConfig = InternalAxiosRequestConfig;

export const userRequest = (config: Partial<RequestConfig>, token?: string) => {
  let authToken = token || null;
  if (!authToken && typeof window !== "undefined") {
    authToken =
      localStorage.getItem("bfb_token") ||
      localStorage.getItem("bfb_token_old");
  }

  const headers = { ...(config.headers || {}) } as Record<string, string>;
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  return api.request({ ...(config as RequestConfig), headers });
};

export const adminRequest = (config: Partial<RequestConfig>) => {
  // WP-проксі та admin-login видалені; цей хелпер залишено як тонкий враппер на випадок,
  // якщо ще є старі виклики. Більше не додає спеціальних заголовків.
  return api.request(config as RequestConfig);
};
