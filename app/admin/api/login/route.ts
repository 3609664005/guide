import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "服务器未配置管理员密码，请设置 ADMIN_PASSWORD 环境变量" },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.isLoggedIn = true;
    await session.save();

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}