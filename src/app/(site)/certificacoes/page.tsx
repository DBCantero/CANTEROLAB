import Image from "next/image";

import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { getAllCertifications } from "@/lib/certifications";
import { createPageMetadata } from "@/lib/metadata";
import { formatDate } from "@/lib/utils";

export const metadata = createPageMetadata({
  title: "Certificações",
  description: "Certificações e trilhas de estudo concluídas por Alef Cantero.",
  path: "/certificacoes",
});

export default function CertificationsPage() {
  const certifications = getAllCertifications();

  return (
    <>
      <PageIntro
        kicker="Aprendizado validado"
        title="Certificações"
        description="Credenciais organizadas com contexto — o que cobrem, quando foram concluídas e onde verificar."
      />
      <section className="listing-section">
        <Container>
          {certifications.length > 0 ? (
            <div className="content-list">
              {certifications.map((certification) => (
                <article className="content-list-item" key={certification.id}>
                  <div className="certification-summary">
                    {certification.imagePath ? (
                      <Image
                        className="certification-badge"
                        src={certification.imagePath}
                        alt={`Selo: ${certification.title}`}
                        width={64}
                        height={64}
                      />
                    ) : null}
                    <div>
                      <p className="eyebrow">{certification.issuer}</p>
                      <h2>{certification.title}</h2>
                      <p>{certification.description}</p>
                      <span className="content-list-meta">
                        <time dateTime={certification.date}>
                          {formatDate(certification.date)}
                        </time>
                        {certification.credentialId
                          ? ` · ID ${certification.credentialId}`
                          : null}
                      </span>
                    </div>
                  </div>
                  {certification.credentialUrl ? (
                    <a
                      className="button button-secondary"
                      href={certification.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver credencial
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="editorial-empty">
              <span aria-hidden="true">certs[]</span>
              <h2>Organizando as credenciais por aqui.</h2>
              <p>
                Esta área já está preparada para receber certificações, sem
                preencher o espaço com dados de exemplo.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
