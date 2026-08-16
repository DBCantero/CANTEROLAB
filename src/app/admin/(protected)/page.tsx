import Link from "next/link";

import { AdminArticleList } from "@/components/admin/admin-article-list";
import { PlusIcon } from "@/components/ui/icons";
import {
  getAdminStorageInfo,
  listAdminArticles,
} from "@/lib/admin/article-repository";

export default async function AdminDashboardPage() {
  const [articles, storage] = await Promise.all([
    listAdminArticles(),
    getAdminStorageInfo(),
  ]);
  const published = articles.filter((article) => article.published).length;
  const drafts = articles.length - published;
  const featured = articles.filter((article) => article.featured).length;

  return (
    <div className="admin-dashboard">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Painel editorial</p>
          <h1>Central de conteúdo</h1>
          <p>Crie, revise e acompanhe tudo o que é publicado no CanteroLab.</p>
        </div>
        <Link className="admin-button admin-button-primary" href="/admin/artigos/novo">
          <PlusIcon />
          Criar artigo
        </Link>
      </header>

      <section className="admin-overview" aria-label="Resumo editorial">
        <dl className="admin-stats">
          <div>
            <dt>Publicados</dt>
            <dd>
              <strong>{published}</strong>
              <span>visíveis no blog</span>
            </dd>
          </div>
          <div>
            <dt>Rascunhos</dt>
            <dd>
              <strong>{drafts}</strong>
              <span>em preparação</span>
            </dd>
          </div>
          <div>
            <dt>Em destaque</dt>
            <dd>
              <strong>{featured}</strong>
              <span>na página inicial</span>
            </dd>
          </div>
        </dl>

        <div className="admin-storage-card">
          <div className="admin-storage-heading">
            <span className={`admin-storage-dot is-${storage.mode}`} aria-hidden="true" />
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
              : "Os artigos são salvos neste computador e não vão para a internet."}
          </p>
        </div>
      </section>

      <AdminArticleList articles={articles} />
    </div>
  );
}
