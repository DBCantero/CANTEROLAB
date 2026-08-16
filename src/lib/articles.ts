import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import matter from "gray-matter";
import type { MDXComponents } from "mdx/types";

import {
  type ArticleFrontmatter,
  validateArticleFrontmatter,
} from "@/lib/article-schema";

export type { ArticleFrontmatter } from "@/lib/article-schema";

export type Article = ArticleFrontmatter & {
  slug: string;
  categorySlug: string;
  href: string;
};

type ArticleModule = {
  default: ComponentType<{ components?: MDXComponents }>;
  frontmatter: unknown;
};

const articlesDirectory = path.join(process.cwd(), "content", "articles");
let articlesCache: Article[] | undefined;

function readArticles(): Article[] {
  if (!fs.existsSync(articlesDirectory)) return [];

  const articles: Article[] = [];
  const categoryDirectories = fs
    .readdirSync(articlesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  for (const categoryDirectory of categoryDirectories) {
    const categorySlug = categoryDirectory.name;

    if (!/^[a-z0-9-]+$/.test(categorySlug)) {
      throw new Error(`Slug de categoria inválido: ${categorySlug}.`);
    }

    const categoryPath = path.join(articlesDirectory, categorySlug);
    const files = fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.name.slice(0, -4);
      const sourceName = `${categorySlug}/${file.name}`;

      if (!/^[a-z0-9-]+$/.test(slug)) {
        throw new Error(`Slug de artigo inválido: ${sourceName}.`);
      }

      const source = fs.readFileSync(path.join(categoryPath, file.name), "utf8");
      const frontmatter = validateArticleFrontmatter(
        matter(source).data,
        sourceName,
      );

      if (!frontmatter.published) continue;

      articles.push({
        ...frontmatter,
        categorySlug,
        slug,
        href: `/artigos/${categorySlug}/${slug}`,
      });
    }
  }

  return articles.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getAllArticles(): Article[] {
  articlesCache ??= readArticles();
  return articlesCache;
}

export function clearArticlesCache() {
  articlesCache = undefined;
}

export function getArticle(
  categorySlug: string,
  slug: string,
): Article | undefined {
  return getAllArticles().find(
    (article) =>
      article.categorySlug === categorySlug && article.slug === slug,
  );
}

export async function loadArticle(
  categorySlug: string,
  slug: string,
): Promise<
  { article: Article; Content: ArticleModule["default"] } | undefined
> {
  const article = getArticle(categorySlug, slug);
  if (!article) return undefined;

  const articleModule = (await import(
    `../../content/articles/${article.categorySlug}/${article.slug}.mdx`
  )) as ArticleModule;
  const compiledFrontmatter = validateArticleFrontmatter(
    articleModule.frontmatter,
    `${article.categorySlug}/${article.slug}.mdx`,
  );

  return {
    article: { ...article, ...compiledFrontmatter },
    Content: articleModule.default,
  };
}

export function getAdjacentArticles(article: Article): {
  previous?: Article;
  next?: Article;
} {
  const allArticles = getAllArticles();
  const index = allArticles.findIndex((item) => item.href === article.href);

  return {
    previous: allArticles[index + 1],
    next: allArticles[index - 1],
  };
}

export function getRelatedArticles(article: Article, limit = 2): Article[] {
  return getAllArticles()
    .filter((candidate) => candidate.href !== article.href)
    .sort((a, b) => {
      const score = (candidate: Article) =>
        Number(candidate.categorySlug === article.categorySlug) * 3 +
        candidate.tags.filter((tag) => article.tags.includes(tag)).length;

      return score(b) - score(a);
    })
    .slice(0, limit);
}
