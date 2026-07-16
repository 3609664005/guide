/**
 * GitHub API 操作 + 本地文件系统回退
 * 
 * - 生产环境 / 已配置 GitHub 环境变量：通过 GitHub API 读写文件
 * - 开发环境 / 未配置 GitHub：直接读写本地文件
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function getGitHubConfig() {
  return {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

function isGitHubConfigured(): boolean {
  const cfg = getGitHubConfig();
  return !!(cfg.token && cfg.owner && cfg.repo);
}

function isLocalMode(): boolean {
  return process.env.NODE_ENV === "development" || !isGitHubConfigured();
}

/** 转义 JSON 中特殊字符 */
function sanitizeJson(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/** 读取本地 JSON 文件 */
function readLocalFile(fileName: string): unknown {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/** 写入本地 JSON 文件 */
function writeLocalFile(fileName: string, data: unknown): void {
  const filePath = path.join(DATA_DIR, fileName);
  const json = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, json, "utf-8");
}

/**
 * 通过 GitHub API 更新文件（服务端专用）
 * 
 * 流程：
 * 1. GET 获取文件当前内容和 sha
 * 2. 在内存中修改
 * 3. PUT 提交
 * 4. 若 409 冲突，抛出错误提示刷新
 */
export async function updateGitHubFile(
  filePath: string,
  newContent: string,
  commitMessage: string
): Promise<void> {
  if (isLocalMode()) {
    // 本地模式：直接写文件
    const fileName = path.basename(filePath);
    writeLocalFile(fileName, JSON.parse(newContent));
    console.log(`[Local] Updated ${fileName}`);
    return;
  }

  // GitHub API 模式
  const { token, owner, repo, branch } = getGitHubConfig();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

  // Step 1: 获取当前文件（含 sha）
  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  let sha: string | undefined;
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  // Step 2: PUT 提交
  const putBody = {
    message: commitMessage,
    content: Buffer.from(newContent, "utf-8").toString("base64"),
    branch,
  } as Record<string, unknown>;
  if (sha) (putBody as Record<string, unknown>).sha = sha;

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(putBody),
  });

  if (putRes.status === 409) {
    throw new Error("保存失败，文件已被他人修改，请刷新页面后重试。");
  }

  if (!putRes.ok) {
    const errBody = await putRes.text();
    throw new Error(`GitHub API 错误 (${putRes.status}): ${errBody}`);
  }
}

/**
 * 验证实体数据
 * 返回 { valid: true } 或 { valid: false, errors: string[] }
 */
export function validateEntity(data: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.push("名称不能为空");
  }
  if (!data.category || typeof data.category !== "string" || data.category.trim() === "") {
    errors.push("分类不能为空");
  }

  // slug 校验：只允许英文、数字、连字符
  if (!data.id || typeof data.id !== "string") {
    errors.push("slug 不能为空");
  } else if (!/^[a-z0-9-]+$/.test(data.id as string)) {
    errors.push("slug 只允许小写英文、数字和连字符");
  }

  // 验证最终 JSON 可解析
  try {
    JSON.stringify(data);
  } catch {
    errors.push("数据包含无法序列化的内容");
  }

  return errors.length === 0 ? { valid: true, errors: [] } : { valid: false, errors };
}

/**
 * 验证 site.config 数据
 */
export function validateSiteConfig(data: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!data.siteName || typeof data.siteName !== "string" || (data.siteName as string).trim() === "") {
    errors.push("网站名称不能为空");
  }
  if (!data.city || typeof data.city !== "string" || (data.city as string).trim() === "") {
    errors.push("城市不能为空");
  }
  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    errors.push("分类列表不能为空");
  }
  try {
    JSON.stringify(data);
  } catch {
    errors.push("数据包含无法序列化的内容");
  }
  return errors.length === 0 ? { valid: true, errors: [] } : { valid: false, errors };
}