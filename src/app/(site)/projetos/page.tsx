import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { projects, projectStatusLabels } from "@/data/projects";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Projetos",
  description: "Projetos pessoais, decisões técnicas e aprendizados do caminho.",
  path: "/projetos",
});

export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        kicker="Construções maiores"
        title="Projetos"
        description="Projetos com contexto: o problema, as escolhas, os desafios e o que cada construção ensinou."
      />
      <section className="listing-section">
        <Container>
          <div className="project-list">
            {projects.map((project, index) => (
              <article className="project-item" key={project.title}>
                <span className="project-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="eyebrow">
                    {projectStatusLabels[project.status]}
                  </p>
                  <h2>{project.title}</h2>
                  <p>{project.description}</p>
                  <ul className="tag-list" aria-label={`Stack de ${project.title}`}>
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
