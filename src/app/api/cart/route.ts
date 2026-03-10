import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  const userCookie = req.cookies.get("bfb_user_jwt")?.value;
  return auth || userCookie || null;
}

function buildHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return headers;
}

function buildNestUrl(path: string, searchParams?: URLSearchParams): string {
  const base = API_BASE?.replace(/\/$/, "") ?? "";
  const query = searchParams?.toString();
  return query ? `${base}/api/cart${path}?${query}` : `${base}/api/cart${path}`;
}

export async function GET(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const url = buildNestUrl("", new URL(req.url).searchParams);
    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(token),
      cache: "no-store",
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No user authentication token provided" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const url = buildNestUrl("", new URL(req.url).searchParams);
    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const url = buildNestUrl("", new URL(req.url).searchParams);
    const response = await fetch(url, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!API_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const url = buildNestUrl("", new URL(req.url).searchParams);
    const response = await fetch(url, {
      method: "DELETE",
      headers: buildHeaders(token),
      cache: "no-store",
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
