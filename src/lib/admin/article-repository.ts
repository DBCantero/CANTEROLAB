import "server-only";

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import {
  articleCategorySlugSchema,
  getArticleCategory,
  validateArticleFrontmatter,
} from "@/lib/article-schema";
import {
  AdminConfigurationError,
  getGitHubContentConfig,
  hasGitHubContentConfig,
} from "@/lib/admin/config";
import { serializeArticle } from "@/lib/admin/article-content";
import { assertAdminSession } from "@/lib/admin/session";
import type {
  AdminArticle,
  AdminArticleSummary,
  AdminStorageInfo,
  ArticleMutation,
  ArticleMutationResult,
} from "@/lib/admin/types";
import { clearArticlesCache } from "@/lib/articles";

const ARTICLE_PATH_PATTERN =
  /^content\/articles\/(sql-server|python|csharp)\/([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx$/;
const LOCAL_ARTICLES_ROOT = path.join(process.cwd(), "content", "articles");
const LOCAL_IMAGES_ROOT = path.join(process.cwd(), "public", "images", "articles");

type GitHubRef = { object: { sha: string } };
type GitHubCommit = { sha: string; tree: { sha: string } };
type GitHubTree = {
  sha: string;
  tree: Array<{
    mode: string;
    path: string;
    sha: string;
    type: "blob" | "tree";
  }>;
  truncated: boolean;
};
type GitHubBlob = { content: string; encoding: "base64"; sha: string };
type GitHubCreatedObject = { sha: string };

export class AdminStorageError extends Error {
  constructor(message = "Não foi possível acessar o repositório de artigos.") {
    super(message);
    this.name = "AdminStorageError";
  }
}

export class AdminContentConflictError extends Error {
  constructor() {
    super(
      "Este artigo mudou desde que você abriu o editor. Atualize a página antes de salvar novamente.",
    );
    this.name = "AdminContentConflictError";
  }
}

function articleIdentity(articlePath: string) {
  const match = ARTICLE_PATH_PATTERN.exec(articlePath);
  if (!match) throw new AdminStorageError("Caminho de artigo inválido.");

  const categoryResult = articleCategorySlugSchema.safeParse(match[1]);
  if (!categoryResult.success) throw new AdminStorageError("Categoria inválida.");

  return { categorySlug: categoryResult.data, slug: match[2] };
}

function parseAdminArticle(
  source: string,
  articlePath: string,
  sha: string,
): AdminArticle {
  const { categorySlug, slug } = articleIdentity(articlePath);
  const parsed = matter(source);
  const frontmatter = validateArticleFrontmatter(parsed.data, articlePath);
  const expectedCategory = getArticleCategory(categorySlug);

  if (frontmatter.category !== expectedCategory.label) {
    throw new AdminStorageError(
      `A categoria declarada em ${articlePath} não corresponde à pasta.`,
    );
  }

  return {
    ...frontmatter,
    body: parsed.content.trim(),
    categorySlug,
    href: `/artigos/${categorySlug}/${slug}`,
    path: articlePath,
    sha,
    slug,
  };
}

function toSummary(article: AdminArticle): AdminArticleSummary {
  const summary: Partial<AdminArticle> = { ...article };
  delete summary.body;
  return summary as AdminArticleSummary;
}

function localSha(source: string) {
  return createHash("sha256").update(source).digest("hex");
}

async function githubRequest<T>(
  endpoint: string,
  init: RequestInit = {},
): Promise<T> {
  const { token } = getGitHubContentConfig();
  let response: Response;

  try {
    response = await fetch(`https://api.github.com${endpoint}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...init.headers,
      },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new AdminStorageError("O GitHub não respondeu a tempo.");
  }

  if (!response.ok) {
    if (response.status === 409 || response.status === 422) {
      throw new AdminContentConflictError();
    }

    if (response.status === 401 || response.status === 403) {
      throw new AdminStorageError(
        "A credencial do GitHub está ausente, expirada ou sem permissão.",
      );
    }

    if (response.status === 404) {
      throw new AdminStorageError(
        "Repositório, branch ou conteúdo não encontrado no GitHub.",
      );
    }

    if (response.status === 429) {
      throw new AdminStorageError(
        "O limite temporário do GitHub foi atingido. Tente novamente em instantes.",
      );
    }

    throw new AdminStorageError();
  }

  return (await response.json()) as T;
}

function githubRepoPath(endpoint: string) {
  const { owner, repo } = getGitHubContentConfig();
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}${endpoint}`;
}

async function getGitHubHead() {
  const { branch } = getGitHubContentConfig();
  const ref = await githubRequest<GitHubRef>(
    githubRepoPath(`/git/ref/heads/${branch}`),
  );
  const commit = await githubRequest<GitHubCommit>(
    githubRepoPath(`/git/commits/${ref.object.sha}`),
  );

  return { commit, headSha: ref.object.sha };
}

async function getGitHubTree(treeSha: string) {
  const tree = await githubRequest<GitHubTree>(
    githubRepoPath(`/git/trees/${treeSha}?recursive=1`),
  );
  if (tree.truncated) {
    throw new AdminStorageError("A árvore do repositório é grande demais.");
  }
  return tree;
}

async function getGitHubBlob(sha: string) {
  const blob = await githubRequest<GitHubBlob>(
    githubRepoPath(`/git/blobs/${sha}`),
  );
  if (blob.encoding !== "base64") throw new AdminStorageError();
  return Buffer.from(blob.content.replace(/\n/g, ""), "base64").toString("utf8");
}

async function createGitHubBlob(content: string | Uint8Array, binary = false) {
  const body = binary
    ? { content: Buffer.from(content).toString("base64"), encoding: "base64" }
    : { content, encoding: "utf-8" };
  return githubRequest<GitHubCreatedObject>(githubRepoPath("/git/blobs"), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function githubArticleEntries(tree: GitHubTree) {
  return tree.tree.filter(
    (entry) => entry.type === "blob" && ARTICLE_PATH_PATTERN.test(entry.path),
  );
}

async function listGitHubArticles() {
  const { commit } = await getGitHubHead();
  const tree = await getGitHubTree(commit.tree.sha);
  const entries = githubArticleEntries(tree);
  const articles = await Promise.all(
    entries.map(async (entry) =>
      parseAdminArticle(await getGitHubBlob(entry.sha), entry.path, entry.sha),
    ),
  );
  return articles.sort((left, right) => right.date.localeCompare(left.date));
}

async function getGitHubArticle(categorySlug: string, slug: string) {
  const targetPath = `content/articles/${categorySlug}/${slug}.mdx`;
  articleIdentity(targetPath);
  const { commit } = await getGitHubHead();
  const tree = await getGitHubTree(commit.tree.sha);
  const entry = githubArticleEntries(tree).find(
    (candidate) => candidate.path === targetPath,
  );
  if (!entry) return undefined;
  return parseAdminArticle(await getGitHubBlob(entry.sha), entry.path, entry.sha);
}

async function saveGitHubArticle(
  mutation: ArticleMutation,
): Promise<ArticleMutationResult> {
  const { article, expectedSha, image } = mutation;
  articleIdentity(article.path);

  const { branch, owner, repo } = getGitHubContentConfig();
  const { commit, headSha } = await getGitHubHead();
  const tree = await getGitHubTree(commit.tree.sha);
  const articleEntries = githubArticleEntries(tree);
  const currentEntry = articleEntries.find((entry) => entry.path === article.path);

  if (
    (expectedSha && currentEntry?.sha !== expectedSha) ||
    (!expectedSha && currentEntry)
  ) {
    throw new AdminContentConflictError();
  }

  const treeChanges: Array<{
    mode: "100644";
    path: string;
    sha: string;
    type: "blob";
  }> = [];
  const articleBlob = await createGitHubBlob(
    serializeArticle(article, article.body),
  );
  treeChanges.push({
    mode: "100644",
    path: article.path,
    sha: articleBlob.sha,
    type: "blob",
  });

  if (image) {
    const imageBlob = await createGitHubBlob(image.bytes, true);
    treeChanges.push({
      mode: "100644",
      path: image.path,
      sha: imageBlob.sha,
      type: "blob",
    });
  }

  if (article.featured) {
    const otherFeatured = await Promise.all(
      articleEntries
        .filter((entry) => entry.path !== article.path)
        .map(async (entry) => {
          const source = await getGitHubBlob(entry.sha);
          const current = parseAdminArticle(source, entry.path, entry.sha);
          return current.featured ? current : undefined;
        }),
    );

    for (const featured of otherFeatured.filter(Boolean) as AdminArticle[]) {
      const source = serializeArticle(
        { ...featured, featured: false },
        featured.body,
      );
      const blob = await createGitHubBlob(source);
      treeChanges.push({
        mode: "100644",
        path: featured.path,
        sha: blob.sha,
        type: "blob",
      });
    }
  }

  const newTree = await githubRequest<GitHubCreatedObject>(
    githubRepoPath("/git/trees"),
    {
      method: "POST",
      body: JSON.stringify({
        base_tree: commit.tree.sha,
        tree: treeChanges,
      }),
    },
  );
  const newCommit = await githubRequest<GitHubCreatedObject>(
    githubRepoPath("/git/commits"),
    {
      method: "POST",
      body: JSON.stringify({
        message: article.published
          ? `Publica artigo: ${article.title}`
          : `Salva rascunho: ${article.title}`,
        parents: [headSha],
        tree: newTree.sha,
      }),
    },
  );

  await githubRequest<GitHubCreatedObject>(
    githubRepoPath(`/git/refs/heads/${branch}`),
    {
      method: "PATCH",
      body: JSON.stringify({ force: false, sha: newCommit.sha }),
    },
  );

  return {
    commitSha: newCommit.sha,
    commitUrl: `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commit/${newCommit.sha}`,
    mode: "github",
  };
}

async function localArticleFiles() {
  const files: string[] = [];

  for (const category of ["sql-server", "python", "csharp"] as const) {
    const directory = path.join(LOCAL_ARTICLES_ROOT, category);
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".mdx")) {
          files.push(`content/articles/${category}/${entry.name}`);
        }
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw error;
    }
  }

  return files;
}

function absoluteArticlePath(articlePath: string) {
  const { categorySlug, slug } = articleIdentity(articlePath);
  return path.join(LOCAL_ARTICLES_ROOT, categorySlug, `${slug}.mdx`);
}

async function listLocalArticles() {
  const files = await localArticleFiles();
  const articles = await Promise.all(
    files.map(async (articlePath) => {
      const source = await fs.readFile(absoluteArticlePath(articlePath), "utf8");
      return parseAdminArticle(source, articlePath, localSha(source));
    }),
  );
  return articles.sort((left, right) => right.date.localeCompare(left.date));
}

async function getLocalArticle(categorySlug: string, slug: string) {
  const articlePath = `content/articles/${categorySlug}/${slug}.mdx`;
  let source: string;
  try {
    source = await fs.readFile(absoluteArticlePath(articlePath), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
  return parseAdminArticle(source, articlePath, localSha(source));
}

async function saveLocalArticle(
  mutation: ArticleMutation,
): Promise<ArticleMutationResult> {
  const { article, expectedSha, image } = mutation;
  const target = absoluteArticlePath(article.path);
  let currentSource: string | undefined;

  try {
    currentSource = await fs.readFile(target, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  if (
    (expectedSha && (!currentSource || localSha(currentSource) !== expectedSha)) ||
    (!expectedSha && currentSource)
  ) {
    throw new AdminContentConflictError();
  }

  if (article.featured) {
    const articles = await listLocalArticles();
    await Promise.all(
      articles
        .filter((candidate) => candidate.featured && candidate.path !== article.path)
        .map((candidate) =>
          fs.writeFile(
            absoluteArticlePath(candidate.path),
            serializeArticle(
              { ...candidate, featured: false },
              candidate.body,
            ),
            "utf8",
          ),
        ),
    );
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  if (image) {
    await fs.mkdir(LOCAL_IMAGES_ROOT, { recursive: true });
    await fs.writeFile(
      path.join(LOCAL_IMAGES_ROOT, path.basename(image.path)),
      image.bytes,
    );
  }

  const source = serializeArticle(article, article.body);
  await fs.writeFile(target, source, "utf8");
  clearArticlesCache();

  return {
    commitSha: localSha(source),
    mode: "local",
  };
}

function shouldUseGitHubStorage() {
  if (hasGitHubContentConfig()) return true;
  if (process.env.NODE_ENV !== "production") return false;
  throw new AdminConfigurationError();
}

export async function getAdminStorageInfo(): Promise<AdminStorageInfo> {
  await assertAdminSession();
  if (shouldUseGitHubStorage()) {
    const { branch, owner, repo } = getGitHubContentConfig();
    return {
      mode: "github",
      detail: `${owner}/${repo} · ${branch}`,
    };
  }
  return { mode: "local", detail: "Arquivos locais de desenvolvimento" };
}

export async function listAdminArticles(): Promise<AdminArticleSummary[]> {
  await assertAdminSession();
  const articles = shouldUseGitHubStorage()
    ? await listGitHubArticles()
    : await listLocalArticles();
  return articles.map(toSummary);
}

export async function getAdminArticle(
  categorySlug: string,
  slug: string,
): Promise<AdminArticle | undefined> {
  await assertAdminSession();
  return shouldUseGitHubStorage()
    ? getGitHubArticle(categorySlug, slug)
    : getLocalArticle(categorySlug, slug);
}

export async function saveAdminArticle(
  mutation: ArticleMutation,
): Promise<ArticleMutationResult> {
  await assertAdminSession();
  return shouldUseGitHubStorage()
    ? saveGitHubArticle(mutation)
    : saveLocalArticle(mutation);
}
