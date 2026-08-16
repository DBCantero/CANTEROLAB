"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { saveArticleAction } from "@/app/admin/actions";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategorySlug,
} from "@/lib/article-schema";
import type { AdminArticle } from "@/lib/admin/types";
import { INITIAL_ADMIN_ACTION_STATE } from "@/lib/admin/types";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function calloutsAsMarkdown(value: string) {
  return value.replace(
    /<Callout(?:\s+title="([^"]*)")?>\s*([\s\S]*?)\s*<\/Callout>/g,
    (_match, title: string | undefined, content: string) =>
      `> **${title || "Nota"}**\n>\n${content
        .trim()
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")}`,
  );
}

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return (
    <span className="admin-field-error" id={id}>
      {errors.join(" ")}
    </span>
  );
}

const resultMessages: Record<string, { title: string; copy: string }> = {
  sent: {
    title: "Artigo enviado para publicação",
    copy: "O commit foi criado. O blog será atualizado assim que o próximo deploy terminar.",
  },
  draft: {
    title: "Rascunho salvo",
    copy: "As alterações já estão no repositório, mas o artigo continua fora do blog.",
  },
  local: {
    title: "Alterações salvas localmente",
    copy: "Este teste ainda não enviou nada ao GitHub.",
  },
};

export function AdminEditorForm({
  article,
  result,
  today,
}: {
  article?: AdminArticle;
  result?: string;
  today: string;
}) {
  const [state, action, pending] = useActionState(
    saveArticleAction,
    INITIAL_ADMIN_ACTION_STATE,
  );
  const [title, setTitle] = useState(article?.title ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [categorySlug, setCategorySlug] = useState(
    article?.categorySlug ?? "sql-server",
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [dirty, setDirty] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const resultMessage = result ? resultMessages[result] : undefined;

  useEffect(() => {
    if (state.status === "error") errorSummaryRef.current?.focus();
  }, [state]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!dirty || pending) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty, pending]);

  const handleTitle = (value: string) => {
    setTitle(value);
    setDirty(true);
    if (!slugTouched) setSlug(slugify(value));
  };

  return (
    <form
      className="admin-editor-form"
      action={action}
      encType="multipart/form-data"
      onChange={() => setDirty(true)}
    >
      {article ? (
        <>
          <input type="hidden" name="originalPath" value={article.path} />
          <input type="hidden" name="expectedSha" value={article.sha} />
          <input type="hidden" name="existingImage" value={article.image ?? ""} />
        </>
      ) : null}

      <header className="admin-editor-header">
        <div>
          <Link href="/admin">← Todos os artigos</Link>
          <p className="admin-eyebrow">{article ? "Editar artigo" : "Novo artigo"}</p>
          <h1>{article ? article.title : "Comece um novo registro."}</h1>
        </div>
        <div className="admin-editor-header-actions">
          {article?.published ? (
            <Link className="admin-button admin-button-quiet" href={article.href} target="_blank">
              Ver artigo <span aria-hidden="true">↗</span>
            </Link>
          ) : null}
        </div>
      </header>

      {resultMessage ? (
        <div className="admin-alert admin-alert-success" role="status">
          <strong>{resultMessage.title}</strong>
          <span>{resultMessage.copy}</span>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          className="admin-alert admin-alert-error"
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
        >
          <strong>Não foi possível salvar</strong>
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="admin-editor">
        <div className="admin-editor-main">
          <section className="admin-form-section" aria-labelledby="content-heading">
            <div className="admin-form-section-heading">
              <div>
                <span>01</span>
                <h2 id="content-heading">Conteúdo</h2>
              </div>
              <p>O título e a descrição aparecem nos cards e buscadores.</p>
            </div>

            <label className="admin-field">
              <span>Título</span>
              <input
                name="title"
                value={title}
                onChange={(event) => handleTitle(event.target.value)}
                maxLength={120}
                required
                aria-invalid={Boolean(state.fieldErrors?.title)}
                aria-describedby={state.fieldErrors?.title ? "title-error" : undefined}
                placeholder="Ex.: Como encontrei uma query lenta"
              />
              <FieldError id="title-error" errors={state.fieldErrors?.title} />
            </label>

            <label className="admin-field">
              <span>Descrição</span>
              <textarea
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                maxLength={240}
                required
                aria-invalid={Boolean(state.fieldErrors?.description)}
                aria-describedby={state.fieldErrors?.description ? "description-error" : "description-help"}
                placeholder="Resuma o problema e o que o leitor vai aprender."
              />
              <small id="description-help">{description.length}/240 caracteres</small>
              <FieldError id="description-error" errors={state.fieldErrors?.description} />
            </label>

            <div className="admin-editor-tabs" aria-label="Visualização do conteúdo">
              <button
                type="button"
                className={activeTab === "write" ? "is-active" : undefined}
                onClick={() => setActiveTab("write")}
                aria-pressed={activeTab === "write"}
              >
                Escrever
              </button>
              <button
                type="button"
                className={activeTab === "preview" ? "is-active" : undefined}
                onClick={() => setActiveTab("preview")}
                aria-pressed={activeTab === "preview"}
              >
                Pré-visualizar
              </button>
            </div>

            {activeTab === "write" ? (
              <label className="admin-field admin-content-field">
                <span className="sr-only">Conteúdo em Markdown</span>
                <textarea
                  name="body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={24}
                  maxLength={120000}
                  required
                  spellCheck
                  aria-invalid={Boolean(state.fieldErrors?.body)}
                  aria-describedby="body-help body-error"
                  placeholder={"Escreva a introdução...\n\n## Primeiro tópico\n\nDesenvolva o conteúdo aqui."}
                />
                <small id="body-help">
                  Markdown, tabelas, código e &lt;Callout title=&quot;Nota&quot;&gt; são aceitos.
                </small>
                <FieldError id="body-error" errors={state.fieldErrors?.body} />
              </label>
            ) : (
              <div className="admin-preview article-content">
                {body.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {calloutsAsMarkdown(body)}
                  </ReactMarkdown>
                ) : (
                  <p className="admin-preview-empty">A prévia aparecerá quando você começar a escrever.</p>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="admin-editor-aside" aria-label="Configurações da publicação">
          <section className="admin-form-section">
            <div className="admin-form-section-heading compact">
              <div><span>02</span><h2>Publicação</h2></div>
            </div>

            <label className="admin-field">
              <span>Categoria</span>
              {article ? (
                <>
                  <input type="hidden" name="categorySlug" value={article.categorySlug} />
                  <select value={article.categorySlug} disabled aria-label="Categoria bloqueada">
                    {ARTICLE_CATEGORIES.map((category) => (
                      <option key={category.slug} value={category.slug}>{category.label}</option>
                    ))}
                  </select>
                </>
              ) : (
                <select
                  name="categorySlug"
                  value={categorySlug}
                  onChange={(event) =>
                    setCategorySlug(event.target.value as ArticleCategorySlug)
                  }
                  required
                >
                  {ARTICLE_CATEGORIES.map((category) => (
                    <option key={category.slug} value={category.slug}>{category.label}</option>
                  ))}
                </select>
              )}
              <FieldError id="category-error" errors={state.fieldErrors?.categorySlug} />
            </label>

            <label className="admin-field">
              <span>Endereço do artigo</span>
              <input
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlug(slugify(event.target.value));
                  setSlugTouched(true);
                }}
                readOnly={Boolean(article)}
                required
                aria-invalid={Boolean(state.fieldErrors?.slug)}
                aria-describedby="slug-help slug-error"
              />
              <small id="slug-help">/artigos/{categorySlug}/{slug || "seu-artigo"}</small>
              <FieldError id="slug-error" errors={state.fieldErrors?.slug} />
            </label>

            <div className="admin-field-row">
              <label className="admin-field">
                <span>Data</span>
                <input name="date" type="date" defaultValue={article?.date ?? today} required />
              </label>
              <label className="admin-field">
                <span>Tempo de leitura</span>
                <input name="readingTime" defaultValue={article?.readingTime ?? "5 min"} required />
              </label>
            </div>

            <label className="admin-field">
              <span>Atualizado em <small>(opcional)</small></span>
              <input
                name="updated"
                type="date"
                defaultValue={
                  article?.updated ?? (article?.published ? today : "")
                }
              />
            </label>

            <label className="admin-field">
              <span>Tags</span>
              <input
                name="tags"
                defaultValue={article?.tags.join(", ") ?? ""}
                required
                aria-describedby="tags-help tags-error"
                placeholder="Performance, SQL, Índices"
              />
              <small id="tags-help">Separe as tags por vírgulas.</small>
              <FieldError id="tags-error" errors={state.fieldErrors?.tags} />
            </label>

            <label className="admin-check-field">
              <input name="featured" type="checkbox" defaultChecked={article?.featured ?? false} />
              <span>
                <strong>Destacar na página inicial</strong>
                <small>O destaque anterior será removido automaticamente.</small>
              </span>
            </label>
          </section>

          <section className="admin-form-section">
            <div className="admin-form-section-heading compact">
              <div><span>03</span><h2>Imagem social</h2></div>
            </div>
            <label className="admin-field admin-file-field">
              <span>JPG, PNG ou WebP</span>
              <input
                name="socialImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-describedby="image-help image-error"
              />
              <small id="image-help">
                Até 3 MB. A imagem será recortada para 1200 × 630 e usada ao compartilhar o artigo.
              </small>
              {article?.image ? <small>Atual: {article.image}</small> : null}
              <FieldError id="image-error" errors={state.fieldErrors?.socialImage} />
            </label>
          </section>
        </aside>
      </div>

      <div className="admin-action-bar">
        <p aria-live="polite">
          {pending ? "Validando e salvando…" : dirty ? "Alterações não salvas" : "Tudo salvo"}
        </p>
        <div>
          <button
            className="admin-button admin-button-secondary"
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
          >
            {article?.published ? "Mover para rascunho" : "Salvar rascunho"}
          </button>
          <button
            className="admin-button admin-button-primary"
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
          >
            {pending ? "Salvando…" : article?.published ? "Atualizar publicação" : "Publicar"}
          </button>
        </div>
      </div>
    </form>
  );
}
