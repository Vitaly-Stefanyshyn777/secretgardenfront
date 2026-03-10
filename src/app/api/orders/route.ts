import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthToken(req: NextRequest): string | null {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const userCookie = req.cookies.get("bfb_user_jwt")?.value;
  return auth || userCookie || null;
}

/** POST /api/orders — створення замовлення (проксі до NestJS) */
export async function POST(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "NEXT_PUBLIC_API_BASE_URL не задано в .env",
        },
        { status: 500 }
      );
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const nestUrl = `${API_BASE.replace(/\/$/, "")}/api/orders`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };

    const res = await fetch(nestUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Order creation error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/** GET /api/orders — список замовлень поточного користувача */
export async function GET(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "NEXT_PUBLIC_API_BASE_URL не задано в .env",
        },
        { status: 500 }
      );
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.toString();
    const nestUrl = `${API_BASE.replace(/\/$/, "")}/api/orders${query ? `?${query}` : ""}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };

    const res = await fetch(nestUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Orders fetch error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
