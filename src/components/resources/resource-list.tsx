import type { Resource } from "@/data/resources";

type ResourceListProps = {
  headingLevel?: 2 | 3;
  resources: Resource[];
};

export function ResourceList({
  headingLevel = 2,
  resources,
}: ResourceListProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  if (resources.length === 0) {
    return (
      <div className="editorial-empty">
        <span aria-hidden="true">bookmarks --curated</span>
        <Heading>A curadoria começa com uso real.</Heading>
        <p>
          As primeiras recomendações entram depois de revisitadas, sem afiliados
          e sem listas genéricas para ocupar espaço.
        </p>
      </div>
    );
  }

  return (
    <div className="content-list">
      {resources.map((resource) => (
        <article className="content-list-item" key={resource.href}>
          <div>
            <p className="eyebrow">{resource.category}</p>
            <Heading>{resource.name}</Heading>
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
  );
}
