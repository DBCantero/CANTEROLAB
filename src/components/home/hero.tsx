import Link from "next/link";

import { ArticleCover } from "@/components/articles/article-cover";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import type { Article } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

export function Hero({ articles }: { articles: Article[] }) {
  const featured = articles.find((article) => article.featured) ?? articles[0];

  return (
    <section className="blog-hero" aria-labelledby="hero-title">
      <Container>
        <header className="blog-masthead">
          <div>
            <p className="blog-kicker">CanteroLab / Blog técnico</p>
            <h1 id="hero-title">Dados, código e problemas reais.</h1>
          </div>
          <div className="blog-masthead-copy">
            <p>
              Investigações, tutoriais e aprendizados sobre SQL Server,
              Python, C# e automação — sempre a partir da prática.
            </p>
            <span>Por {siteConfig.author}, desenvolvedor de Backend & Dados.</span>
          </div>
        </header>

        {featured ? (
          <article className="featured-article">
            <div className="featured-article-cover">
              <ArticleCover article={featured} />
            </div>
            <div className="featured-article-content">
              <p className="featured-label">
                <span aria-hidden="true" /> Artigo em destaque
              </p>
              <div className="featured-meta">
                <span>{featured.category}</span>
                <time dateTime={featured.date}>{formatDate(featured.date)}</time>
              </div>
              <h2>
                <Link href={featured.href}>{featured.title}</Link>
              </h2>
              <p className="featured-description">{featured.description}</p>
              <ul className="featured-tags" aria-label="Tags do artigo">
                {featured.tags.slice(0, 3).map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <div className="featured-footer">
                <span>{featured.readingTime}</span>
                <span className="featured-read-more" aria-hidden="true">
                  Ler artigo <ArrowRightIcon />
                </span>
              </div>
            </div>
          </article>
        ) : null}
      </Container>
    </section>
  );
}
