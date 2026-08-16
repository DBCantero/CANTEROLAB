import type {
  ArticleCategorySlug,
  ArticleFrontmatter,
} from "@/lib/article-schema";

export type AdminArticle = ArticleFrontmatter & {
  body: string;
  categorySlug: ArticleCategorySlug;
  href: string;
  path: string;
  sha: string;
  slug: string;
};

export type AdminArticleSummary = Omit<AdminArticle, "body">;

export type AdminStorageMode = "github" | "local";

export type AdminStorageInfo = {
  detail: string;
  mode: AdminStorageMode;
};

export type ArticleMutation = {
  article: AdminArticle;
  expectedSha?: string;
  image?: {
    bytes: Uint8Array;
    path: string;
  };
  originalPath?: string;
};

export type ArticleMutationResult = {
  commitSha: string;
  commitUrl?: string;
  mode: AdminStorageMode;
};

export type AdminActionState = {
  fieldErrors?: Record<string, string[]>;
  message?: string;
  status: "idle" | "error";
};

export const INITIAL_ADMIN_ACTION_STATE: AdminActionState = {
  status: "idle",
};
