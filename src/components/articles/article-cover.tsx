import type { Article } from "@/lib/articles";
import { TechnologyLogo } from "@/components/ui/technology-logo";
import { cn } from "@/lib/utils";

const coverContent: Record<string, { detail: string }> = {
  "sql-server": { detail: "queries · performance" },
  python: { detail: "scripts · automação" },
  csharp: { detail: "api · .net" },
};

export function ArticleCover({
  article,
  className,
}: {
  article: Article;
  className?: string;
}) {
  const content = coverContent[article.categorySlug] ?? {
    detail: "nota técnica",
  };

  return (
    <div
      className={cn(
        "article-cover",
        `article-cover-${article.categorySlug}`,
        className,
      )}
      aria-hidden="true"
    >
      <span className="article-cover-pattern" />
      <span className="article-cover-topline">
        <span>{article.category}</span>
        <span>canterolab_</span>
      </span>
      <span className="article-cover-logo">
        <TechnologyLogo slug={article.categorySlug} />
      </span>
      <span className="article-cover-bottomline">
        <span>{content.detail}</span>
        <span className="article-cover-signal">
          <i />
          <i />
          <i />
        </span>
      </span>
    </div>
  );
}
