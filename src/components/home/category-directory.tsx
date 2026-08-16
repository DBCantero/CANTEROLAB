import Link from "next/link";

import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { TechnologyLogo } from "@/components/ui/technology-logo";
import type { Article } from "@/lib/articles";

export function CategoryDirectory({ articles }: { articles: Article[] }) {
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

  if (categories.length === 0) return null;

  return (
    <section className="category-directory" aria-labelledby="categories-heading">
      <Container>
        <header className="blog-section-heading compact">
          <div>
            <p className="blog-section-kicker">Navegue pelo conteúdo</p>
            <h2 id="categories-heading">Explore por tema</h2>
          </div>
        </header>
        <ul className="category-directory-grid">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/artigos/${category.slug}`}>
                <span
                  className={`category-directory-mark category-directory-mark-${category.slug}`}
                  aria-hidden="true"
                >
                  <TechnologyLogo slug={category.slug} />
                </span>
                <span className="category-directory-copy">
                  <strong>{category.label}</strong>
                  <span>
                    {category.count} {category.count === 1 ? "artigo" : "artigos"}
                  </span>
                </span>
                <ArrowRightIcon />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
