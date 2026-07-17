"use server";

import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { getAllEntities } from "@/lib/entities";

/** slug 校验：非空，只允许字母数字连字符，最长 100 */
function isValidSlug(slug: unknown): slug is string {
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    slug.length <= 100 &&
    /^[a-zA-Z0-9-]+$/.test(slug)
  );
}

function getGitHubConfig() {
  return {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

/** 本地环境直接读写 JSON */
async function deleteLocal(slug: string, entityName: string) {
  const dataPath = path.join(process.cwd(), "data", "entities.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const entities = JSON.parse(raw);

  const originalLength = entities.length;
  const filtered = entities.filter((e: { id: string }) => e.id !== slug);

  if (filtered.length === originalLength) {
    throw new Error(`未找到 slug 为 "${slug}" 的实体`);
  }

  fs.writeFileSync(dataPath, JSON.stringify(filtered, null, 2) + "\n", "utf-8");
  console.log(`[Local] Deleted entity: ${entityName} (${slug})`);
}

/** GitHub API 删除 */
async function deleteViaGitHub(slug: string, entityName: string) {
  const { token, owner, repo, branch } = getGitHubConfig();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/data/entities.json?ref=${branch}`;

  // Step 1: GET 当前文件
  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!getRes.ok) {
    throw new Error(`读取文件失败 (${getRes.status})`);
  }

  const fileData = await getRes.json();
  const sha: string = fileData.sha;
  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  const entities = JSON.parse(content);

  // Step 2: 过滤
  const originalLength = entities.length;
  const filtered = entities.filter((e: { id: string }) => e.id !== slug);

  if (filtered.length === originalLength) {
    throw new Error(`未找到 slug 为 "${slug}" 的实体`);
  }

  // Step 3: PUT 提交
  const newContent = JSON.stringify(filtered, null, 2);
  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `删除实体: ${entityName}`,
      content: Buffer.from(newContent, "utf-8").toString("base64"),
      sha,
      branch,
    }),
  });

  if (putRes.status === 409) {
    throw new Error("保存失败，文件已被他人修改，请刷新后重试");
  }

  if (!putRes.ok) {
    throw new Error("删除失败，请稍后重试");
  }
}

/**
 * 删除实体（Server Action）
 * 仅在服务端执行，Token 绝不暴露给前端
 */
export async function deleteEntity(slug: string, entityName: string): Promise<{ success: boolean }> {
  // 1. 鉴权
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.isLoggedIn) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. slug 校验
  if (!isValidSlug(slug)) {
    throw new Error("INVALID_SLUG");
  }

  // 3. 执行删除
  const isLocal = process.env.NODE_ENV === "development" || !process.env.GITHUB_TOKEN;

  if (isLocal) {
    await deleteLocal(slug, entityName);
  } else {
    await deleteViaGitHub(slug, entityName);
  }

  return { success: true };
}
