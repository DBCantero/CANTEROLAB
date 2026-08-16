import Link from "next/link";

import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { labEntries } from "@/data/lab";

export function LabPreview() {
  const current =
    labEntries.find((entry) => entry.status === "em-andamento") ?? labEntries[0];
  const others = labEntries.filter((entry) => entry.title !== current?.title).slice(0, 3);

  if (!current) return null;

  return (
    <section className="lab-highlight-section" aria-labelledby="lab-heading">
      <Container>
        <header className="blog-section-heading">
          <div>
            <p className="blog-section-kicker">Além dos artigos</p>
            <h2 id="lab-heading">Projetos e estudos em andamento</h2>
            <p>O que estou construindo, testando e tentando entender agora.</p>
          </div>
          <Link className="text-link" href="/lab">
            Ver tudo no Lab
            <ArrowRightIcon />
          </Link>
        </header>

        <div className="lab-highlight-grid">
          <article className="lab-feature-card">
            <div className="lab-feature-topline">
              <span>{current.detail}</span>
              <StatusBadge status={current.status} />
            </div>
            <h3>{current.title}</h3>
            <p>{current.description}</p>
            <Link className="button button-secondary" href="/lab">
              Conhecer o projeto
              <ArrowRightIcon />
            </Link>
          </article>

          <div className="lab-compact-list">
            {others.map((entry) => (
              <article key={entry.title}>
                <div>
                  <span>{entry.detail}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.description}</p>
                </div>
                <StatusBadge status={entry.status} />
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
