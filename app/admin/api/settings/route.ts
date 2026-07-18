import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { SessionData } from "@/lib/session";
import { validateSiteConfig, updateGitHubFile } from "@/lib/github";
import siteConfig from "@/site.config";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const categories = body.categoriesText
      ? (body.categoriesText as string).split("\n").map((s: string) => s.trim()).filter(Boolean)
      : siteConfig.categories;

    const aboutSections: Array<{ heading: string; body: string }> = [];
    if (body.aboutSectionsText) {
      const blocks = (body.aboutSectionsText as string).split(/\n\n+/);
      for (const block of blocks) {
        const lines = block.trim().split("\n");
        if (lines.length >= 2 && lines[0].startsWith("## ")) {
          const heading = lines[0].replace(/^##\s+/, "").trim();
          const bodyText = lines.slice(1).join("\n").trim();
          if (heading && bodyText) aboutSections.push({ heading, body: bodyText });
        }
      }
    }

    const newConfig = {
      siteName: body.siteName,
      siteDescription: body.siteDescription || "",
      city: body.city,
      categories,
      baseUrl: body.baseUrl || "https://example.com",
      about: {
        title: body.aboutTitle || `关于${body.siteName}`,
        sections: aboutSections.length > 0 ? aboutSections : siteConfig.about.sections,
      },
    };

    const validation = validateSiteConfig(newConfig);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join("；") }, { status: 400 });
    }

    const newContent = JSON.stringify(newConfig, null, 2);
    await updateGitHubFile("data/site.config.json", newContent, "更新网站配置");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}