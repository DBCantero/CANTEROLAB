"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TechnologyLogo } from "@/components/ui/technology-logo";
import { ARTICLE_CATEGORIES } from "@/lib/article-schema";
import type { AdminArticleSummary } from "@/lib/admin/types";
import { formatDate } from "@/lib/utils";

export function AdminArticleList({
  articles,
}: {
  articles: AdminArticleSummary[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return articles.filter((article) => {
      const matchesQuery =
        !normalizedQuery ||
        article.title.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ||
        article.slug.includes(normalizedQuery);
      const matchesCategory =
        category === "all" || article.categorySlug === category;
      const matchesStatus =
        status === "all" ||
        (status === "published" && article.published) ||
        (status === "draft" && !article.published);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [articles, category, query, status]);

  return (
    <section className="admin-posts" aria-labelledby="admin-posts-title">
      <div className="admin-section-heading">
        <div>
          <h2 id="admin-posts-title">Conteúdo</h2>
          <p>{filtered.length} {filtered.length === 1 ? "artigo" : "artigos"}</p>
        </div>
        <div className="admin-toolbar">
          <label>
            <span className="sr-only">Buscar artigo</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título ou slug"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por categoria</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Todas as categorias</option>
              {ARTICLE_CATEGORIES.map((item) => (
                <option value={item.slug} key={item.slug}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrar por status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Todos os status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="admin-post-list">
          {filtered.map((article) => (
            <article className="admin-post-row" key={article.path}>
              <span className="admin-post-logo" aria-hidden="true">
                <TechnologyLogo slug={article.categorySlug} />
              </span>
              <div className="admin-post-copy">
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <small>/{article.categorySlug}/{article.slug}</small>
              </div>
              <time dateTime={article.updated ?? article.date}>
                {formatDate(article.updated ?? article.date)}
              </time>
              <div className="admin-post-statuses">
                <span className={`admin-status ${article.published ? "is-published" : "is-draft"}`}>
                  {article.published ? "Publicado" : "Rascunho"}
                </span>
                {article.featured ? <span className="admin-status is-featured">Destaque</span> : null}
              </div>
              <div className="admin-post-actions">
                {article.published ? (
                  <Link href={article.href} target="_blank">Ver</Link>
                ) : null}
                <Link href={`/admin/artigos/${article.categorySlug}/${article.slug}`}>
                  Editar
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-empty-state">
          Nenhum artigo corresponde aos filtros escolhidos.
        </p>
      )}
    </section>
  );
}
