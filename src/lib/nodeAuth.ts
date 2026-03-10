const BASE_URL =
  `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"}/api`;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
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
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
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

