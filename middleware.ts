import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只拦截 /admin 路径
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // 登录页和 API 不需要拦截
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/") || pathname.startsWith("/admin/api/")) {
    return NextResponse.next();
  }

  // 检查 session
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: "/admin/:path*",
};