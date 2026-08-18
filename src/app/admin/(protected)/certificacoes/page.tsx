import Link from "next/link";

import { AdminCertificationList } from "@/components/admin/admin-certification-list";
import { PlusIcon } from "@/components/ui/icons";
import { getAdminStorageInfo } from "@/lib/admin/article-repository";
import { listAdminCertifications } from "@/lib/admin/certification-repository";

export default async function AdminCertificationsPage() {
  const [certifications, storage] = await Promise.all([
    listAdminCertifications(),
    getAdminStorageInfo(),
  ]);
  const withCredential = certifications.filter(
    (certification) => certification.credentialUrl,
  ).length;

  return (
    <div className="admin-dashboard">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Painel editorial</p>
          <h1>Certificações</h1>
          <p>Cadastre credenciais e mantenha a página pública atualizada.</p>
        </div>
        <Link
          className="admin-button admin-button-primary"
          href="/admin/certificacoes/novo"
        >
          <PlusIcon />
          Nova certificação
        </Link>
      </header>

      <section className="admin-overview" aria-label="Resumo de certificações">
        <dl className="admin-stats">
          <div>
            <dt>Cadastradas</dt>
            <dd>
              <strong>{certifications.length}</strong>
              <span>visíveis em /certificacoes</span>
            </dd>
          </div>
          <div>
            <dt>Com link de credencial</dt>
            <dd>
              <strong>{withCredential}</strong>
              <span>verificáveis publicamente</span>
            </dd>
          </div>
        </dl>

        <div className="admin-storage-card">
          <div className="admin-storage-heading">
            <span
              className={`admin-storage-dot is-${storage.mode}`}
              aria-hidden="true"
            />
            <div>
              <strong>
                {storage.mode === "github" ? "GitHub conectado" : "Modo local"}
              </strong>
              <small>{storage.detail}</small>
            </div>
          </div>
          <p>
            {storage.mode === "github"
              ? "Ao salvar, um commit é criado e uma nova publicação começa na Vercel."
              : "As certificações são salvas neste computador e não vão para a internet."}
          </p>
        </div>
      </section>

      <AdminCertificationList certifications={certifications} />
    </div>
  );
}
