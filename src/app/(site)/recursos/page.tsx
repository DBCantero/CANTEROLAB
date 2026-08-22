import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { ResourceList } from "@/components/resources/resource-list";
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
          <ResourceList resources={resources} />
        </Container>
      </section>
    </>
  );
}
