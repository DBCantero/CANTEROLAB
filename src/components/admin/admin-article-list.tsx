"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TechnologyLogo } from "@/components/ui/technology-logo";
import {
  ArrowUpRightIcon,
  PencilIcon,
  SearchIcon,
} from "@/components/ui/icons";
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
  const hasFilters = Boolean(query || category !== "all" || status !== "all");

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
  };

  return (
    <section className="admin-posts" aria-labelledby="admin-posts-title">
      <div className="admin-section-heading">
        <div>
          <p className="admin-eyebrow">Biblioteca</p>
          <h2 id="admin-posts-title">Seus artigos</h2>
          <p aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>
        <div className="admin-toolbar">
          <label className="admin-search-field">
            <span>Buscar</span>
            <span className="admin-search-control">
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Título ou endereço"
              />
            </span>
          </label>
          <label>
            <span>Categoria</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Todas</option>
              {ARTICLE_CATEGORIES.map((item) => (
                <option value={item.slug} key={item.slug}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
          </label>
          {hasFilters ? (
            <button className="admin-clear-filters" type="button" onClick={clearFilters}>
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="admin-post-list">
          <div className="admin-post-columns" aria-hidden="true">
            <span>Artigo</span>
            <span>Última alteração</span>
            <span>Status</span>
            <span>Ações</span>
          </div>
          {filtered.map((article) => (
            <article className="admin-post-row" key={article.path}>
              <div className="admin-post-summary">
                <span className="admin-post-logo" aria-hidden="true">
                  <TechnologyLogo slug={article.categorySlug} />
                </span>
                <div className="admin-post-copy">
                  <span>{article.category}</span>
                  <h3>
                    <Link href={`/admin/artigos/${article.categorySlug}/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <small>/artigos/{article.categorySlug}/{article.slug}</small>
                </div>
              </div>
              <div className="admin-post-date">
                <span>Última alteração</span>
                <time dateTime={article.updated ?? article.date}>
                  {formatDate(article.updated ?? article.date)}
                </time>
              </div>
              <div className="admin-post-statuses">
                <span className="admin-mobile-label">Status</span>
                <span className={`admin-status ${article.published ? "is-published" : "is-draft"}`}>
                  {article.published ? "Publicado" : "Rascunho"}
                </span>
                {article.featured ? <span className="admin-status is-featured">Destaque</span> : null}
              </div>
              <div className="admin-post-actions">
                {article.published ? (
                  <Link
                    className="admin-post-action admin-post-action-quiet"
                    href={article.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Ver ${article.title} no blog`}
                  >
                    <ArrowUpRightIcon />
                    <span>Ver</span>
                  </Link>
                ) : null}
                <Link
                  className="admin-post-action"
                  href={`/admin/artigos/${article.categorySlug}/${article.slug}`}
                  aria-label={`Editar ${article.title}`}
                >
                  <PencilIcon />
                  <span>Editar</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty-state">
          <strong>{articles.length === 0 ? "Sua biblioteca está vazia." : "Nenhum artigo encontrado."}</strong>
          <p>
            {articles.length === 0
              ? "Crie o primeiro artigo para começar a organizar o conteúdo do blog."
              : "Tente mudar a busca ou limpar os filtros escolhidos."}
          </p>
          {hasFilters ? (
            <button type="button" onClick={clearFilters}>Limpar filtros</button>
          ) : null}
        </div>
      )}
    </section>
  );
}
