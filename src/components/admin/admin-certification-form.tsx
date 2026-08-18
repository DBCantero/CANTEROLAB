"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { saveCertificationAction } from "@/app/admin/actions";
import { FieldError } from "@/components/admin/field-error";
import type { AdminCertification } from "@/lib/admin/certification-repository";
import { INITIAL_ADMIN_ACTION_STATE } from "@/lib/admin/types";

const resultMessages: Record<string, { title: string; copy: string }> = {
  sent: {
    title: "Certificação enviada",
    copy: "O commit foi criado. O blog será atualizado assim que o próximo deploy terminar.",
  },
  local: {
    title: "Alterações salvas localmente",
    copy: "Este teste ainda não enviou nada ao GitHub.",
  },
};

export function AdminCertificationForm({
  certification,
  result,
  today,
}: {
  certification?: AdminCertification;
  result?: string;
  today: string;
}) {
  const [state, action, pending] = useActionState(
    saveCertificationAction,
    INITIAL_ADMIN_ACTION_STATE,
  );
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

  return (
    <form
      className="admin-editor-form"
      action={action}
      encType="multipart/form-data"
      onChange={() => setDirty(true)}
    >
      {certification ? (
        <>
          <input type="hidden" name="id" value={certification.id} />
          <input type="hidden" name="expectedSha" value={certification.sha} />
          <input
            type="hidden"
            name="existingImage"
            value={certification.imagePath ?? ""}
          />
        </>
      ) : null}

      <header className="admin-editor-header">
        <div className="admin-editor-heading">
          <Link href="/admin/certificacoes">
            <span aria-hidden="true">←</span>
            Todas as certificações
          </Link>
          <div className="admin-editor-title-row">
            <div>
              <p className="admin-eyebrow">Credenciais</p>
              <h1>{certification ? "Editar certificação" : "Nova certificação"}</h1>
            </div>
          </div>
          <p className="admin-editor-subtitle">
            {certification
              ? certification.title
              : "Cadastre o certificado, o emissor e o link de verificação."}
          </p>
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
          <section
            className="admin-form-section"
            aria-labelledby="cert-content-heading"
          >
            <div className="admin-form-section-heading">
              <div>
                <h2 id="cert-content-heading">Certificação</h2>
              </div>
              <p>Título, emissor e descrição aparecem na página pública.</p>
            </div>

            <label className="admin-field admin-title-field">
              <span>Título</span>
              <input
                id="certification-title"
                name="title"
                defaultValue={certification?.title}
                maxLength={120}
                required
                aria-invalid={Boolean(state.fieldErrors?.title)}
                aria-describedby={state.fieldErrors?.title ? "title-error" : undefined}
                placeholder="Ex.: Azure Data Fundamentals"
              />
              <FieldError id="title-error" errors={state.fieldErrors?.title} />
            </label>

            <label className="admin-field">
              <span>Emissor</span>
              <input
                id="certification-issuer"
                name="issuer"
                defaultValue={certification?.issuer}
                maxLength={120}
                required
                aria-invalid={Boolean(state.fieldErrors?.issuer)}
                aria-describedby={state.fieldErrors?.issuer ? "issuer-error" : undefined}
                placeholder="Ex.: Microsoft"
              />
              <FieldError id="issuer-error" errors={state.fieldErrors?.issuer} />
            </label>

            <label className="admin-field">
              <span>Descrição</span>
              <textarea
                id="certification-description"
                name="description"
                defaultValue={certification?.description}
                rows={3}
                maxLength={320}
                required
                aria-invalid={Boolean(state.fieldErrors?.description)}
                aria-describedby={
                  state.fieldErrors?.description
                    ? "description-help description-error"
                    : "description-help"
                }
                placeholder="O que essa certificação cobre."
              />
              <small id="description-help">Até 320 caracteres.</small>
              <FieldError
                id="description-error"
                errors={state.fieldErrors?.description}
              />
            </label>
          </section>
        </div>

        <aside className="admin-editor-aside" aria-label="Credencial e selo">
          <section className="admin-form-section">
            <div className="admin-form-section-heading compact">
              <div>
                <h2>Credencial</h2>
              </div>
            </div>

            <label className="admin-field">
              <span>Data</span>
              <input
                id="certification-date"
                name="date"
                type="date"
                defaultValue={certification?.date ?? today}
                required
                aria-invalid={Boolean(state.fieldErrors?.date)}
                aria-describedby={state.fieldErrors?.date ? "date-error" : undefined}
              />
              <FieldError id="date-error" errors={state.fieldErrors?.date} />
            </label>

            <label className="admin-field">
              <span>
                ID da credencial <small>(opcional)</small>
              </span>
              <input
                id="certification-credential-id"
                name="credentialId"
                defaultValue={certification?.credentialId ?? ""}
                maxLength={80}
                aria-invalid={Boolean(state.fieldErrors?.credentialId)}
                aria-describedby={
                  state.fieldErrors?.credentialId ? "credential-id-error" : undefined
                }
              />
              <FieldError
                id="credential-id-error"
                errors={state.fieldErrors?.credentialId}
              />
            </label>

            <label className="admin-field">
              <span>
                Link da credencial <small>(opcional)</small>
              </span>
              <input
                id="certification-credential-url"
                name="credentialUrl"
                type="url"
                defaultValue={certification?.credentialUrl ?? ""}
                maxLength={300}
                placeholder="https://"
                aria-invalid={Boolean(state.fieldErrors?.credentialUrl)}
                aria-describedby={
                  state.fieldErrors?.credentialUrl
                    ? "credential-url-help credential-url-error"
                    : "credential-url-help"
                }
              />
              <small id="credential-url-help">
                URL pública pra verificar a credencial.
              </small>
              <FieldError
                id="credential-url-error"
                errors={state.fieldErrors?.credentialUrl}
              />
            </label>
          </section>

          <section className="admin-form-section">
            <div className="admin-form-section-heading compact">
              <div>
                <h2>Selo</h2>
              </div>
            </div>
            <label className="admin-field admin-file-field">
              <span>JPG, PNG ou WebP</span>
              <input
                name="badge"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-invalid={Boolean(state.fieldErrors?.badge)}
                aria-describedby={
                  state.fieldErrors?.badge ? "badge-help badge-error" : "badge-help"
                }
              />
              <small id="badge-help">
                Até 3 MB. Será ajustado a um quadrado de 480 × 480 e exibido ao
                lado da certificação.
              </small>
              {certification?.imagePath ? (
                <small>Atual: {certification.imagePath}</small>
              ) : null}
              <FieldError id="badge-error" errors={state.fieldErrors?.badge} />
            </label>
          </section>
        </aside>
      </div>

      <div className="admin-action-bar">
        <div className="admin-action-bar-inner">
          <p aria-live="polite">
            <span
              className={
                pending
                  ? "is-pending"
                  : dirty
                    ? "is-dirty"
                    : certification
                      ? "is-saved"
                      : "is-neutral"
              }
              aria-hidden="true"
            />
            {pending
              ? "Salvando…"
              : dirty
                ? "Alterações não salvas"
                : certification
                  ? "Nenhuma alteração pendente"
                  : "Nova certificação ainda não salva"}
          </p>
          <div className="admin-action-buttons">
            <button
              className="admin-button admin-button-primary"
              type="submit"
              disabled={pending}
            >
              {pending
                ? "Salvando…"
                : certification
                  ? "Salvar alterações"
                  : "Salvar certificação"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
