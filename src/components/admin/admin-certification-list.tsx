"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { deleteCertificationAction } from "@/app/admin/actions";
import {
  AwardIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { AdminCertification } from "@/lib/admin/certification-repository";
import { formatDate } from "@/lib/utils";

export function AdminCertificationList({
  certifications,
}: {
  certifications: AdminCertification[];
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedQuery) return certifications;
    return certifications.filter(
      (certification) =>
        certification.title.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ||
        certification.issuer.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
    );
  }, [certifications, query]);

  return (
    <section
      className="admin-posts"
      aria-labelledby="admin-certifications-title"
    >
      <div className="admin-section-heading">
        <div>
          <p className="admin-eyebrow">Credenciais</p>
          <h2 id="admin-certifications-title">Suas certificações</h2>
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
                placeholder="Título ou emissor"
              />
            </span>
          </label>
          {query ? (
            <button
              className="admin-clear-filters"
              type="button"
              onClick={() => setQuery("")}
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="admin-post-list">
          <div className="admin-post-columns" aria-hidden="true">
            <span>Certificação</span>
            <span>Data</span>
            <span>Credencial</span>
            <span>Ações</span>
          </div>
          {filtered.map((certification) => (
            <article className="admin-post-row" key={certification.id}>
              <div className="admin-post-summary">
                <span className="admin-post-logo" aria-hidden="true">
                  <AwardIcon />
                </span>
                <div className="admin-post-copy">
                  <span>{certification.issuer}</span>
                  <h3>
                    <Link href={`/admin/certificacoes/${certification.id}`}>
                      {certification.title}
                    </Link>
                  </h3>
                </div>
              </div>
              <div className="admin-post-date">
                <span>Data</span>
                <time dateTime={certification.date}>
                  {formatDate(certification.date)}
                </time>
              </div>
              <div className="admin-post-statuses">
                <span className="admin-mobile-label">Credencial</span>
                <span
                  className={`admin-status ${certification.credentialUrl ? "is-published" : "is-draft"}`}
                >
                  {certification.credentialUrl ? "Com link" : "Sem link"}
                </span>
              </div>
              <div className="admin-post-actions">
                <Link
                  className="admin-post-action"
                  href={`/admin/certificacoes/${certification.id}`}
                  aria-label={`Editar ${certification.title}`}
                >
                  <PencilIcon />
                  <span>Editar</span>
                </Link>
                <form
                  action={deleteCertificationAction}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `Excluir "${certification.title}"? Essa ação não pode ser desfeita.`,
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={certification.id} />
                  <button
                    className="admin-post-action admin-post-action-quiet"
                    type="submit"
                    aria-label={`Excluir ${certification.title}`}
                  >
                    <TrashIcon />
                    <span>Excluir</span>
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty-state">
          <strong>
            {certifications.length === 0
              ? "Sua lista de certificações está vazia."
              : "Nenhuma certificação encontrada."}
          </strong>
          <p>
            {certifications.length === 0
              ? "Cadastre a primeira certificação para começar a preencher a página pública."
              : "Tente mudar a busca."}
          </p>
          {query ? (
            <button type="button" onClick={() => setQuery("")}>
              Limpar busca
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
