import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Перевіряємо чи це маршрут профілю
  if (pathname.startsWith("/profile")) {
    // Перевіряємо наявність токену в cookies
    const token = request.cookies.get("bfb_user_jwt")?.value;

    // Якщо токену немає, повертаємо 404
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/not-found";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
  ],
};
