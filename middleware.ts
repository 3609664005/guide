import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // 301 redirect: touristguide.cn -> www.touristguide.cn
  if (host === "touristguide.cn") {
    const newUrl = new URL(pathname + request.nextUrl.search, "https://www.touristguide.cn");
    return NextResponse.redirect(newUrl, 301);
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // 不需要鉴权的路径
  const publicPaths = [
    "/admin/login",
    "/admin/api/",
  ];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p)
  );
  if (isPublic) return NextResponse.next();

  // 检查登录态
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname === "/admin" ? "/admin/dashboard" : pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: "/((?!_next|api/|favicon.ico|images/|.*\.svg|.*\.png|.*\.jpg|.*\.ico).)*",
};
