import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { validateEntity, updateGitHubFile } from "@/lib/github";
import { getAllEntities } from "@/lib/entities";
import type { Entity } from "@/lib/entities";

export async function GET(request: NextRequest) {
  try {
    const entities = getAllEntities();
    return NextResponse.json(entities);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions);
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateEntity(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join("；") }, { status: 400 });
    }

    const newEntity: Entity = {
      id: body.id,
      name: body.name,
      category: body.category,
      summary: body.summary || "",
      address: body.address || "",
      lat: body.lat,
      lon: body.lon,
      priceRange: body.priceRange,
      tags: Array.isArray(body.tags) ? body.tags : [],
      openingHours: body.openingHours,
      lastConfirmedDate: body.lastConfirmedDate || new Date().toISOString().slice(0, 10),
      personalNote: body.personalNote || "",
      imageUrl: body.imageUrl || "/images/placeholder.svg",
      detailFields: body.detailFields || {},
    };

    const allEntities = getAllEntities();
    const existingIndex = allEntities.findIndex((e) => e.id === body.id);

    if (existingIndex >= 0) {
      allEntities[existingIndex] = newEntity;
    } else {
      allEntities.push(newEntity);
    }

    const newContent = JSON.stringify(allEntities, null, 2);
    const commitMsg = existingIndex >= 0
      ? `更新实体: ${newEntity.name}`
      : `新增实体: ${newEntity.name}`;

    await updateGitHubFile("data/entities.json", newContent, commitMsg);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
