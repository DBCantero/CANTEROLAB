import "server-only";

import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import { z } from "zod";

import {
  articleCategorySlugSchema,
  articleFrontmatterSchema,
  articleSlugSchema,
  getArticleCategory,
  type ArticleCategorySlug,
  type ArticleFrontmatter,
} from "@/lib/article-schema";

const MAX_ARTICLE_BODY_LENGTH = 120_000;

type SafeMdxNode = {
  attributes?: Array<{
    name?: string;
    type?: string;
    value?: unknown;
  }>;
  children?: SafeMdxNode[];
  depth?: number;
  name?: string | null;
  position?: { start?: { line?: number } };
  type: string;
  url?: string;
};

const editorFieldsSchema = z.object({
  title: z.string().trim().min(5, "Escreva um título mais descritivo.").max(120),
  description: z
    .string()
    .trim()
    .min(20, "A descrição precisa ter pelo menos 20 caracteres.")
    .max(240),
  date: z.string().trim(),
  updated: z.string().trim().optional(),
  categorySlug: articleCategorySlugSchema,
  slug: articleSlugSchema,
  tags: z.string().trim().min(1, "Adicione pelo menos uma tag."),
  readingTime: z.string().trim(),
  body: z
    .string()
    .trim()
    .min(40, "O artigo precisa ter um pouco mais de conteúdo.")
    .max(MAX_ARTICLE_BODY_LENGTH, "O artigo ultrapassou o limite de tamanho."),
  existingImage: z.string().trim().optional(),
  originalPath: z.string().trim().optional(),
  expectedSha: z.string().trim().optional(),
});

export type ValidatedArticleInput = {
  body: string;
  categorySlug: ArticleCategorySlug;
  expectedSha?: string;
  frontmatter: ArticleFrontmatter;
  originalPath?: string;
  path: string;
  slug: string;
};

export type ArticleFormValidation =
  | { data: ValidatedArticleInput; success: true }
  | {
      fieldErrors: Record<string, string[]>;
      message: string;
      success: false;
    };

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function safeUrl(url: string) {
  const normalized = url.trim();
  if (/^(#|\/[^/]|\.\.?\/)/.test(normalized)) return true;

  try {
    const parsed = new URL(normalized);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function nodeLocation(node: SafeMdxNode) {
  return node.position?.start?.line
    ? ` na linha ${node.position.start.line}`
    : "";
}

function validateSafeMdxTree(tree: SafeMdxNode) {
  const visit = (node: SafeMdxNode) => {
    if (
      node.type === "mdxjsEsm" ||
      node.type === "mdxFlowExpression" ||
      node.type === "mdxTextExpression"
    ) {
      throw new Error(
        `Expressões JavaScript e importações não são permitidas${nodeLocation(node)}.`,
      );
    }

    if (node.type === "html") {
      throw new Error(`HTML direto não é permitido${nodeLocation(node)}.`);
    }

    if (node.type === "heading" && node.depth === 1) {
      throw new Error(
        `Use títulos a partir de ## dentro do artigo${nodeLocation(node)}.`,
      );
    }

    if (
      node.type === "mdxJsxTextElement" ||
      (node.type === "mdxJsxFlowElement" && node.name !== "Callout")
    ) {
      throw new Error(
        `Somente o componente <Callout> é permitido${nodeLocation(node)}.`,
      );
    }

    if (node.type === "mdxJsxFlowElement") {
      if ((node.attributes?.length ?? 0) > 1) {
        throw new Error(
          `O <Callout> aceita no máximo um título${nodeLocation(node)}.`,
        );
      }
      for (const attribute of node.attributes ?? []) {
        const validTitle =
          attribute.type === "mdxJsxAttribute" &&
          attribute.name === "title" &&
          typeof attribute.value === "string";

        if (!validTitle) {
          throw new Error(
            `O <Callout> aceita somente um título em texto${nodeLocation(node)}.`,
          );
        }
      }
    }

    if ((node.type === "link" || node.type === "image") && node.url) {
      if (!safeUrl(node.url)) {
        throw new Error(`Link inseguro encontrado${nodeLocation(node)}.`);
      }
    }

    node.children?.forEach(visit);
  };

  visit(tree);
}

function remarkSafeAdminContent() {
  return validateSafeMdxTree;
}

export async function validateSafeArticleBody(body: string) {
  try {
    await compile(body, {
      remarkPlugins: [remarkGfm, remarkSafeAdminContent],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MDX inválido.";
    throw new Error(`Revise o conteúdo do artigo: ${message}`);
  }
}

function zodFieldErrors(error: z.ZodError) {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fields[field] ??= [];
    fields[field].push(issue.message);
  }

  return fields;
}

export async function validateArticleForm(
  formData: FormData,
): Promise<ArticleFormValidation> {
  const fieldsResult = editorFieldsSchema.safeParse({
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    date: getString(formData, "date"),
    updated: getString(formData, "updated") || undefined,
    categorySlug: getString(formData, "categorySlug"),
    slug: getString(formData, "slug"),
    tags: getString(formData, "tags"),
    readingTime: getString(formData, "readingTime"),
    body: getString(formData, "body"),
    existingImage: getString(formData, "existingImage") || undefined,
    originalPath: getString(formData, "originalPath") || undefined,
    expectedSha: getString(formData, "expectedSha") || undefined,
  });

  if (!fieldsResult.success) {
    return {
      success: false,
      message: "Revise os campos destacados antes de salvar.",
      fieldErrors: zodFieldErrors(fieldsResult.error),
    };
  }

  const fields = fieldsResult.data;
  const tags = fields.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const category = getArticleCategory(fields.categorySlug);
  const intent = getString(formData, "intent");
  const published = intent === "publish";

  const frontmatterResult = articleFrontmatterSchema.safeParse({
    title: fields.title,
    description: fields.description,
    date: fields.date,
    updated: fields.updated,
    category: category.label,
    tags,
    published,
    featured: formData.get("featured") === "on",
    readingTime: fields.readingTime,
    image: fields.existingImage,
  });

  if (!frontmatterResult.success) {
    return {
      success: false,
      message: "Revise os dados de publicação antes de salvar.",
      fieldErrors: zodFieldErrors(frontmatterResult.error),
    };
  }

  try {
    await validateSafeArticleBody(fields.body);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Conteúdo inválido.",
      fieldErrors: { body: ["O conteúdo contém uma marcação não permitida."] },
    };
  }

  const path = `content/articles/${fields.categorySlug}/${fields.slug}.mdx`;
  if (fields.originalPath && fields.originalPath !== path) {
    return {
      success: false,
      message: "Categoria e endereço não podem ser alterados depois da criação.",
      fieldErrors: {
        slug: ["Crie outro artigo se precisar mudar o endereço."],
      },
    };
  }

  return {
    success: true,
    data: {
      body: fields.body,
      categorySlug: fields.categorySlug,
      expectedSha: fields.expectedSha,
      frontmatter: frontmatterResult.data,
      originalPath: fields.originalPath,
      path,
      slug: fields.slug,
    },
  };
}

export function serializeArticle(
  frontmatter: ArticleFrontmatter,
  body: string,
) {
  const orderedFrontmatter = {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    ...(frontmatter.updated ? { updated: frontmatter.updated } : {}),
    category: frontmatter.category,
    tags: frontmatter.tags,
    published: frontmatter.published,
    featured: frontmatter.featured ?? false,
    readingTime: frontmatter.readingTime,
    ...(frontmatter.image ? { image: frontmatter.image } : {}),
  };

  return matter.stringify(`${body.trim()}\n`, orderedFrontmatter);
}
