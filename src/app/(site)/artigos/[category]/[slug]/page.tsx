import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/article-card";
import { Container } from "@/components/ui/container";
import { TechnologyLogo } from "@/components/ui/technology-logo";
import {
  getAdjacentArticles,
  getAllArticles,
  getArticle,
  getRelatedArticles,
  loadArticle,
} from "@/lib/articles";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((article) => ({
    category: article.categorySlug,
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getArticle(category, slug);

  if (!article) return {};

  const image = article.image ?? "/opengraph-image";

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    alternates: { canonical: article.href },
    openGraph: {
      type: "article",
      url: article.href,
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      modifiedTime: article.updated,
      tags: article.tags,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [image],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const loadedArticle = await loadArticle(category, slug);

  if (!loadedArticle) notFound();

  const { article, Content } = loadedArticle;
  const { previous, next } = getAdjacentArticles(article);
  const related = getRelatedArticles(article);
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    author: { "@type": "Person", name: siteConfig.author },
    mainEntityOfPage: absoluteUrl(article.href),
    url: absoluteUrl(article.href),
    image: absoluteUrl(article.image ?? "/opengraph-image"),
    inLanguage: "pt-BR",
    keywords: article.tags.join(", "),
  }).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <article className="article-page">
        <Container>
          <header className="article-header">
            <div
              className={`article-header-context article-header-context-${article.categorySlug}`}
            >
              <span className="article-header-logo" aria-hidden="true">
                <TechnologyLogo slug={article.categorySlug} />
              </span>
              <div>
                <p className="article-header-category">{article.category}</p>
                <nav className="breadcrumbs" aria-label="Navegação estrutural">
                  <Link href="/artigos">Artigos</Link>
                  <span aria-hidden="true">/</span>
                  <Link href={`/artigos/${article.categorySlug}`}>
                    {article.category}
                  </Link>
                </nav>
              </div>
            </div>
            <h1>{article.title}</h1>
            <p className="article-deck">{article.description}</p>
            <div className="article-byline">
              <span>Por Cantero</span>
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span>{article.readingTime} de leitura</span>
            </div>
            <ul className="tag-list" aria-label="Tags">
              {article.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </header>

          <div className="article-content">
            <Content />
          </div>

          <nav className="article-pagination" aria-label="Artigos anterior e seguinte">
            {previous ? (
              <Link href={previous.href}>
                <span>← Artigo anterior</span>
                <strong>{previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={next.href}>
                <span>Próximo artigo →</span>
                <strong>{next.title}</strong>
              </Link>
            ) : null}
          </nav>
        </Container>
      </article>

      {related.length > 0 ? (
        <section className="related-section" aria-labelledby="related-heading">
          <Container>
            <p className="eyebrow">Continue explorando</p>
            <h2 id="related-heading">Artigos relacionados</h2>
            <div className="listing-grid related-grid">
              {related.map((item) => (
                <ArticleCard
                  article={item}
                  headingLevel={3}
                  key={item.href}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
