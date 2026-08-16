import Link from "next/link";

import { ArticleCard } from "@/components/articles/article-card";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Article } from "@/lib/articles";

export function RecentEntries({ articles }: { articles: Article[] }) {
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const recent = articles
    .filter((article) => article.href !== featured?.href)
    .slice(0, 6);

  return (
    <section className="recent-posts-section" aria-labelledby="recent-heading">
      <Container>
        <header className="blog-section-heading">
          <div>
            <p className="blog-section-kicker">Conteúdo recente</p>
            <h2 id="recent-heading">Artigos recentes</h2>
            <p>
              Tutoriais, investigações e anotações para consultar quando o
              mesmo problema aparecer de novo.
            </p>
          </div>
          <Link className="text-link" href="/artigos">
            Ver todos os artigos
            <ArrowRightIcon />
          </Link>
        </header>

        {recent.length > 0 ? (
          <div className="home-post-grid">
            {recent.map((article) => (
              <ArticleCard
                key={article.href}
                article={article}
                headingLevel={3}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            Os primeiros registros estão sendo preparados.
          </p>
        )}
      </Container>
    </section>
  );
}
