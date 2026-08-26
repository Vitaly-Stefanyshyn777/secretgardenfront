const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api`;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  phone?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      message = data.message || data.error || message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function loginNode(payload: LoginPayload): Promise<AuthTokens> {
  const body: Record<string, string> = {
    password: payload.password,
  };
  if (payload.email?.trim()) {
    body.email = payload.email.trim().toLowerCase();
  }
  if (payload.phone?.trim()) {
    body.phone = payload.phone.trim();
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<AuthTokens>(res);
}

export async function signupNode(payload: SignupPayload): Promise<AuthTokens> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      firstname: payload.firstname,
      lastname: payload.lastname,
      middlename: payload.middlename,
    }),
  });

  return handleResponse<AuthTokens>(res);
}

export async function refreshNode(
  refreshToken: string,
): Promise<AuthTokens> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: refreshToken }),
  });

  return handleResponse<AuthTokens>(res);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  await handleResponse<{ ok: boolean }>(res);
}

export async function validatePasswordResetCode(
  email: string,
  code: string,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/validate-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  await handleResponse<{ ok: boolean }>(res);
}

export async function setPasswordWithResetCode(
  email: string,
  code: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/set-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, password }),
  });
  await handleResponse<{ ok: boolean }>(res);
}
