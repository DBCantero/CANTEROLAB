import { z } from "zod";

export const ARTICLE_CATEGORIES = [
  { slug: "sql-server", label: "SQL Server" },
  { slug: "python", label: "Python" },
  { slug: "csharp", label: "C#" },
] as const;

export type ArticleCategorySlug = (typeof ARTICLE_CATEGORIES)[number]["slug"];

export const articleCategoryBySlug = Object.fromEntries(
  ARTICLE_CATEGORIES.map((category) => [category.slug, category]),
) as Record<ArticleCategorySlug, (typeof ARTICLE_CATEGORIES)[number]>;

export const articleSlugSchema = z
  .string()
  .trim()
  .min(3, "O slug precisa ter pelo menos 3 caracteres.")
  .max(90, "O slug pode ter no máximo 90 caracteres.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use somente letras minúsculas, números e hífens no slug.",
  );

export const articleCategorySlugSchema = z.enum([
  "sql-server",
  "python",
  "csharp",
]);

function isRealIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const isoDateSchema = z
  .string()
  .refine(isRealIsoDate, "Use uma data real no formato AAAA-MM-DD.");

export const safeImageSchema = z
  .string()
  .trim()
  .max(240, "O caminho da imagem é muito longo.")
  .refine((value) => {
    if (/^https:\/\//i.test(value)) return true;
    return /^\/(?!\/)(?!.*\.\.)[a-zA-Z0-9/_\-.]+$/.test(value);
  }, "Use um caminho local iniciado por / ou uma URL HTTPS.");

const tagsSchema = z
  .array(z.string().trim().min(1).max(40))
  .min(1, "Adicione pelo menos uma tag.")
  .max(8, "Use no máximo 8 tags.")
  .superRefine((tags, context) => {
    const normalized = tags.map((tag) => tag.toLocaleLowerCase("pt-BR"));
    if (new Set(normalized).size !== tags.length) {
      context.addIssue({
        code: "custom",
        message: "Não repita tags.",
      });
    }
  });

export const articleFrontmatterSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    description: z.string().trim().min(20).max(240),
    date: isoDateSchema,
    updated: isoDateSchema.optional(),
    category: z.string().trim().min(1).max(40),
    tags: tagsSchema,
    published: z.boolean(),
    featured: z.boolean().optional(),
    readingTime: z
      .string()
      .trim()
      .regex(/^\d{1,3}\s+min$/, 'Use o formato "5 min".'),
    image: safeImageSchema.optional(),
  })
  .strict()
  .superRefine((article, context) => {
    if (article.updated && article.updated < article.date) {
      context.addIssue({
        code: "custom",
        path: ["updated"],
        message: "A atualização não pode ser anterior à publicação.",
      });
    }
  });

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export function validateArticleFrontmatter(
  value: unknown,
  source: string,
): ArticleFrontmatter {
  const result = articleFrontmatterSchema.safeParse(value);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const field = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
        return `${field}${issue.message}`;
      })
      .join("; ");

    throw new Error(`Frontmatter inválido em ${source}. ${details}`);
  }

  return result.data;
}

export function getArticleCategory(slug: ArticleCategorySlug) {
  return articleCategoryBySlug[slug];
}
