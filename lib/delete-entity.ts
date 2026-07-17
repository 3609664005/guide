"use server";

import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

interface EntityItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

function isValidSlug(slug: unknown): slug is string {
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    slug.length <= 100 &&
    /^[a-zA-Z0-9-]+$/.test(slug)
  );
}

const DATA_DIR = path.join(process.cwd(), "data");
const ENTITIES_FILE = "data/entities.json";

function readLocalEntities(): EntityItem[] {
  const filePath = path.join(DATA_DIR, "entities.json");
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as EntityItem[];
  } catch {
    return [];
  }
}

function writeLocalEntities(entities: EntityItem[]): void {
  const filePath = path.join(DATA_DIR, "entities.json");
  fs.writeFileSync(filePath, JSON.stringify(entities, null, 2) + "\n", "utf-8");
}

function getGitHubConfig() {
  return {
    token: process.env.GITHUB_TOKEN || "",
    owner: process.env.GITHUB_OWNER || "",
    repo: process.env.GITHUB_REPO || "",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

function hasGitHubConfig(): boolean {
  const cfg = getGitHubConfig();
  return !!(cfg.token && cfg.owner && cfg.repo);
}

async function fetchFromGitHub(): Promise<{
  entities: EntityItem[];
  sha: string;
} | null> {
  const { token, owner, repo, branch } = getGitHubConfig();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${ENTITIES_FILE}?ref=${branch}`;

  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`[GitHub GET] 失败: ${res.status}`);
    return null;
  }

  const fileData = await res.json();
  if (!fileData.content || !fileData.sha) {
    console.error("[GitHub GET] 响应缺少 content/sha");
    return null;
  }

  const rawContent = (fileData.content as string).replace(/\s/g, "");
  const decoded = Buffer.from(rawContent, "base64").toString("utf-8");

  let entities: EntityItem[];
  try {
    entities = JSON.parse(decoded);
  } catch {
    console.error("[GitHub GET] JSON 解析失败");
    return null;
  }

  if (!Array.isArray(entities)) {
    console.error("[GitHub GET] 内容不是数组");
    return null;
  }

  return { entities, sha: fileData.sha as string };
}

async function putToGitHub(
  entities: EntityItem[],
  sha: string,
  commitMessage: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { token, owner, repo, branch } = getGitHubConfig();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${ENTITIES_FILE}`;

  const newContent = JSON.stringify(entities, null, 2);

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(newContent, "utf-8").toString("base64"),
      sha,
      branch,
    }),
  });

  if (res.status === 409) {
    return { ok: false, message: "保存失败，文件已被他人修改，请刷新后重试" };
  }

  if (!res.ok) {
    return { ok: false, message: `GitHub API 错误 (${res.status})` };
  }

  return { ok: true };
}

function findIndex(entities: EntityItem[], slug: string): number {
  return entities.findIndex((e) => String(e.id).trim() === slug);
}

export async function deleteEntity(
  slug: string,
  entityName: string
): Promise<{ success: boolean }> {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.isLoggedIn) {
    throw new Error("UNAUTHORIZED");
  }

  if (!isValidSlug(slug)) {
    throw new Error("INVALID_SLUG");
  }

  const isDev = process.env.NODE_ENV === "development";
  const useGitHub = hasGitHubConfig();

  if (!useGitHub) {
    const entities = readLocalEntities();
    const idx = findIndex(entities, slug);
    if (idx === -1) {
      throw new Error(`未找到 slug 为 "${slug}" 的实体`);
    }
    entities.splice(idx, 1);
    writeLocalEntities(entities);
    return { success: true };
  }

  let deletedLocally = false;
  if (isDev) {
    const localEntities = readLocalEntities();
    const localIdx = findIndex(localEntities, slug);
    if (localIdx !== -1) {
      localEntities.splice(localIdx, 1);
      writeLocalEntities(localEntities);
      deletedLocally = true;
    }
  }

  const ghResult = await fetchFromGitHub();
  if (!ghResult) {
    if (deletedLocally) return { success: true };
    throw new Error("无法连接 GitHub API，请检查 GITHUB_TOKEN 和仓库配置");
  }

  const { entities, sha } = ghResult;
  const ghIdx = findIndex(entities, slug);

  if (ghIdx === -1) {
    if (deletedLocally) return { success: true };

    const localEntities = readLocalEntities();
    const localIdx = findIndex(localEntities, slug);

    if (localIdx !== -1) {
      throw new Error(
        `该实体存在于本地部署文件中，但 GitHub 仓库的 entities.json 中没有找到它。` +
        `请确认：(1) GitHub 仓库地址和分支是否正确；` +
        `(2) entities.json 是否已提交到 GitHub。` +
        `（本地路径：data/entities.json，GitHub 仓库：${getGitHubConfig().owner}/${getGitHubConfig().repo}）`
      );
    }

    throw new Error(`未找到 slug 为 "${slug}" 的实体`);
  }

  entities.splice(ghIdx, 1);

  const putResult = await putToGitHub(entities, sha, `删除实体: ${entityName}`);
  if (!putResult.ok) {
    throw new Error(putResult.message);
  }

  return { success: true };
}
