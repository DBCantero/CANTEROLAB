import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { resources } from "@/data/resources";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Recursos",
  description: "Cursos, livros, ferramentas e documentações recomendados.",
  path: "/recursos",
});

export default function ResourcesPage() {
  return (
    <>
      <PageIntro
        kicker="Valeu o tempo"
        title="Recursos"
        description="Cursos, livros, ferramentas e referências que foram úteis de verdade — acompanhados do motivo da recomendação."
      />
      <section className="listing-section">
        <Container>
          {resources.length > 0 ? (
            <div className="content-list">
              {resources.map((resource) => (
                <article className="content-list-item" key={resource.href}>
                  <div>
                    <p className="eyebrow">{resource.category}</p>
                    <h2>{resource.name}</h2>
                    <p>{resource.description}</p>
                    <p className="resource-reason">
                      <strong>Por que recomendo:</strong> {resource.reason}
                    </p>
                    <ul className="tag-list" aria-label={`Tags de ${resource.name}`}>
                      {resource.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                  <a
                    className="button button-secondary"
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visitar recurso
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="editorial-empty">
              <span aria-hidden="true">bookmarks --curated</span>
              <h2>A curadoria começa com uso real.</h2>
              <p>
                As primeiras recomendações entram depois de revisitadas, sem
                afiliados e sem listas genéricas para ocupar espaço.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
