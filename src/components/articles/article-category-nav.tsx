import Link from "next/link";

import type { Article } from "@/lib/articles";

export function ArticleCategoryNav({
  articles,
  currentCategory,
}: {
  articles: Article[];
  currentCategory?: string;
}) {
  const categories = Array.from(
    articles.reduce(
      (map, article) => {
        const current = map.get(article.categorySlug);
        map.set(article.categorySlug, {
          slug: article.categorySlug,
          label: article.category,
          count: (current?.count ?? 0) + 1,
        });
        return map;
      },
      new Map<string, { slug: string; label: string; count: number }>(),
    ).values(),
  );

  return (
    <nav className="category-nav" aria-label="Categorias dos artigos">
      <Link
        href="/artigos"
        aria-current={currentCategory ? undefined : "page"}
      >
        <span>Todos</span>
        <small aria-hidden="true">{articles.length}</small>
        <span className="sr-only">
          {articles.length} {articles.length === 1 ? "artigo" : "artigos"}
        </span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/artigos/${category.slug}`}
          aria-current={
            currentCategory === category.slug ? "page" : undefined
          }
        >
          <span>{category.label}</span>
          <small aria-hidden="true">{category.count}</small>
          <span className="sr-only">
            {category.count} {category.count === 1 ? "artigo" : "artigos"}
          </span>
        </Link>
      ))}
    </nav>
  );
}
