import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/article-card";
import { ArticleCategoryNav } from "@/components/articles/article-category-nav";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { getAllArticles } from "@/lib/articles";
import { createPageMetadata } from "@/lib/metadata";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from(
    new Set(getAllArticles().map((article) => article.categorySlug)),
  ).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const firstArticle = getAllArticles().find(
    (article) => article.categorySlug === category,
  );

  if (!firstArticle) return {};

  return createPageMetadata({
    title: `Artigos de ${firstArticle.category}`,
    description: `Registros e aprendizados sobre ${firstArticle.category}.`,
    path: `/artigos/${category}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const allArticles = getAllArticles();
  const articles = allArticles.filter(
    (article) => article.categorySlug === category,
  );

  if (articles.length === 0) notFound();

  return (
    <>
      <PageIntro
        kicker="Categoria"
        title={articles[0].category}
        description={`Notas, investigações e aprendizados sobre ${articles[0].category}.`}
      >
        <ArticleCategoryNav
          articles={allArticles}
          currentCategory={category}
        />
      </PageIntro>
      <section className="listing-section" aria-label="Artigos desta categoria">
        <Container>
          <div
            className={
              articles.length === 1 ? "listing-grid is-single" : "listing-grid"
            }
          >
            {articles.map((article) => (
              <ArticleCard
                key={article.href}
                article={article}
                variant={articles.length === 1 ? "wide" : "default"}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
