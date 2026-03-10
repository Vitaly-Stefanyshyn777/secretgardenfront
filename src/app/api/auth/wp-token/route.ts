import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Silent login: fetch JWT from WP and set httpOnly cookie
export async function GET(_req: NextRequest) {
  try {
    const username = process.env.ADMIN_USER;
    const password = process.env.ADMIN_PASS;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing ADMIN_USER/ADMIN_PASS" },
        { status: 500 }
      );
    }

    const url = `${API_BASE}/wp-json/jwt-auth/v1/token`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `WP token error: ${res.status}`, details: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    const token: string | undefined = data?.token || data?.data?.token;
    if (!token) {
      return NextResponse.json(
        { error: "Token not returned by WP" },
        { status: 502 }
      );
    }

    const response = NextResponse.json({ ok: true });
    // Store token in httpOnly cookie for server-side proxies
    response.cookies.set("wp_jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  } catch (e) {
    return NextResponse.json({ error: "auth error" }, { status: 500 });
  }
}
