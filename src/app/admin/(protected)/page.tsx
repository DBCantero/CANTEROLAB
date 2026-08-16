import Link from "next/link";

import { AdminArticleList } from "@/components/admin/admin-article-list";
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
    <>
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Painel editorial</p>
          <h1>Artigos</h1>
          <p>Escreva, revise e acompanhe o conteúdo do CanteroLab.</p>
        </div>
        <Link className="admin-button admin-button-primary" href="/admin/artigos/novo">
          <span aria-hidden="true">＋</span> Novo artigo
        </Link>
      </header>

      <dl className="admin-stats">
        <div>
          <dt>Publicados</dt>
          <dd>{published}</dd>
        </div>
        <div>
          <dt>Rascunhos</dt>
          <dd>{drafts}</dd>
        </div>
        <div>
          <dt>Em destaque</dt>
          <dd>{featured}</dd>
        </div>
      </dl>

      <div className="admin-storage-note">
        <span className={`admin-storage-dot is-${storage.mode}`} aria-hidden="true" />
        <span>
          {storage.mode === "github" ? "Conectado ao GitHub" : "Modo local"}
        </span>
        <small>{storage.detail}</small>
      </div>

      <AdminArticleList articles={articles} />
    </>
  );
}
