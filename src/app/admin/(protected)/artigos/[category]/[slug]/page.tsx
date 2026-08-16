import Link from "next/link";

import { AdminEditorForm } from "@/components/admin/admin-editor-form";
import { getAdminArticle } from "@/lib/admin/article-repository";
import { todayInTimeZone } from "@/lib/utils";

type AdminEditPageProps = {
  params: Promise<{ category: string; slug: string }>;
  searchParams: Promise<{ result?: string }>;
};

export default async function EditAdminArticlePage({
  params,
  searchParams,
}: AdminEditPageProps) {
  const { category, slug } = await params;
  const [{ result }, article] = await Promise.all([
    searchParams,
    getAdminArticle(category, slug),
  ]);

  if (!article) {
    return (
      <section className="admin-missing">
        <p className="admin-eyebrow">Artigo não encontrado</p>
        <h1>Este registro não está mais no repositório.</h1>
        <Link className="admin-button admin-button-primary" href="/admin">
          Voltar aos artigos
        </Link>
      </section>
    );
  }

  return (
    <AdminEditorForm
      article={article}
      result={result}
      today={todayInTimeZone()}
    />
  );
}
