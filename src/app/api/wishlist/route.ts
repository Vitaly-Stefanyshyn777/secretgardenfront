import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

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

export async function GET(req: NextRequest) {
  try {

    if (!API_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    const isCheck = searchParams.get("check") === "true";

    const token = getAuthToken(req);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No authentication token provided" },
        { status: 401 }
      );
    }

    const headers = buildHeaders(token);
    const params = new URLSearchParams();
    if (isCheck && productId) params.set("check", "true");
    if (productId) params.set("product_id", productId);
    const qs = params.toString();
    const url = `${API_BASE}/api/wishlist${qs ? `?${qs}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
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
      { error: "Wishlist API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {

    if (!API_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = await req.json();
    const { action, product_id } = body;
    const token = getAuthToken(req);
    const headers = buildHeaders(token);

    let url: string;
    let method = "POST";

    if (action === "remove" && product_id) {
      url = `${API_BASE}/api/wishlist/${product_id}`;
      method = "DELETE";
      const cleanBody = { ...body };
      delete cleanBody.action;
      delete cleanBody.product_id;

      const response = await fetch(url, {
        method,
        headers,
        body: Object.keys(cleanBody).length > 0 ? JSON.stringify(cleanBody) : undefined,
        cache: "no-store",
      });

      const data = await response.text();
      return new NextResponse(data, {
        status: response.status,
        headers: {
          "content-type": response.headers.get("content-type") || "application/json",
        },
      });
    }

    url = `${API_BASE}/api/wishlist`;

    const response = await fetch(url, {
      method: "POST",
      headers,
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
      { error: "Wishlist API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {

    if (!API_BASE) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    const isClear = searchParams.get("clear") === "true";

    const token = getAuthToken(req);
    const headers = buildHeaders(token);

    const path = isClear
      ? "/api/wishlist/clear"
      : `/api/wishlist/${productId}`;
    const response = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers,
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
      { error: "Wishlist API error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
