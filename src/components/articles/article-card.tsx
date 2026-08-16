import Link from "next/link";

import { ArticleCover } from "@/components/articles/article-cover";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Article } from "@/lib/articles";
import { cn, formatDate } from "@/lib/utils";

type ArticleCardProps = {
  article: Article;
  headingLevel?: 2 | 3;
  variant?: "default" | "wide";
};

export function ArticleCard({
  article,
  headingLevel = 2,
  variant = "default",
}: ArticleCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className={cn("article-card", variant === "wide" && "is-wide")}>
      <div className="article-card-cover">
        <ArticleCover article={article} />
      </div>
      <div className="article-card-body">
        <div className="article-card-meta">
          <span>{article.category}</span>
          <time dateTime={article.date}>{formatDate(article.date)}</time>
        </div>
        <Heading>
          <Link href={article.href}>{article.title}</Link>
        </Heading>
        <p className="article-card-description">{article.description}</p>
        <div className="article-card-footer">
          <span>{article.readingTime}</span>
          <span className="article-card-read-more" aria-hidden="true">
            Ler artigo <ArrowRightIcon />
          </span>
        </div>
      </div>
    </article>
  );
}
