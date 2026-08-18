import Link from "next/link";

import { AdminCertificationForm } from "@/components/admin/admin-certification-form";
import { getAdminCertification } from "@/lib/admin/certification-repository";
import { todayInTimeZone } from "@/lib/utils";

type AdminEditCertificationPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
};

export default async function EditAdminCertificationPage({
  params,
  searchParams,
}: AdminEditCertificationPageProps) {
  const { id } = await params;
  const [{ result }, certification] = await Promise.all([
    searchParams,
    getAdminCertification(id),
  ]);

  if (!certification) {
    return (
      <section className="admin-missing">
        <p className="admin-eyebrow">Certificação não encontrada</p>
        <h1>Este registro não está mais no repositório.</h1>
        <Link className="admin-button admin-button-primary" href="/admin/certificacoes">
          Voltar às certificações
        </Link>
      </section>
    );
  }

  return (
    <AdminCertificationForm
      certification={certification}
      result={result}
      today={todayInTimeZone()}
    />
  );
}
