export type ResourceCategory =
  | "Curso"
  | "Livro"
  | "Site"
  | "Ferramenta"
  | "Documentação"
  | "Canal"
  | "Comunidade";

export type Resource = {
  name: string;
  category: ResourceCategory;
  description: string;
  reason: string;
  href: string;
  tags: string[];
};

// Recomendações pessoais serão adicionadas sem links afiliados nesta fase.
export const resources: Resource[] = [];
