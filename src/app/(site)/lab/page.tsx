import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { StatusBadge } from "@/components/ui/status-badge";
import { labEntries } from "@/data/lab";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Lab",
  description: "Experimentos, estudos e projetos em andamento no CanteroLab.",
  path: "/lab",
});

export default function LabPage() {
  return (
    <>
      <PageIntro
        kicker="Experimentos em processo"
        title="Lab"
        description="Nem tudo começa pronto para virar projeto ou artigo. Aqui ficam os testes, as perguntas e as coisas que ainda estou tentando entender."
      />
      <section className="listing-section">
        <Container>
          <div className="lab-list lab-page-list">
            {labEntries.map((entry, index) => (
              <article className="lab-item" key={entry.title}>
                <span className="lab-item-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="lab-item-copy">
                  <p className="lab-item-detail">{entry.detail}</p>
                  <h2>{entry.title}</h2>
                  <p>{entry.description}</p>
                </div>
                <StatusBadge status={entry.status} />
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
