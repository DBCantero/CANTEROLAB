import { ArticleCard } from "@/components/articles/article-card";
import { ArticleCategoryNav } from "@/components/articles/article-category-nav";
import { PageIntro } from "@/components/ui/page-intro";
import { Container } from "@/components/ui/container";
import { getAllArticles } from "@/lib/articles";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Artigos",
  description:
    "Registros técnicos sobre SQL Server, banco de dados, Python, C#, .NET e automação.",
  path: "/artigos",
});

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <>
      <PageIntro
        kicker="Blog técnico"
        title="Artigos"
        description="Problemas que apareceram, hipóteses que não funcionaram e o que aprendi enquanto tentava entender melhor cada assunto."
      >
        <ArticleCategoryNav articles={articles} />
      </PageIntro>

      <section className="listing-section" aria-label="Todos os artigos">
        <Container>
          <div className="listing-grid">
            {articles.map((article) => (
              <ArticleCard key={article.href} article={article} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
