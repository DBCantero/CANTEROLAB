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

export const resources: Resource[] = [
  {
    name: "Gravar consultas avançadas do Transact-SQL",
    category: "Curso",
    description:
      "Roteiro da Microsoft Learn sobre objetos temporários, operadores de conjunto, funções de janela e transformação de dados.",
    reason:
      "organiza recursos avançados de T-SQL em módulos curtos e aplicáveis a consultas do dia a dia.",
    href: "https://learn.microsoft.com/pt-br/training/paths/write-advanced-transact-sql-queries/",
    tags: ["SQL Server", "T-SQL", "Avançado"],
  },
  {
    name: "Tutorial oficial do Python",
    category: "Documentação",
    description:
      "Introdução prática à linguagem, passando por estruturas de dados, módulos, entrada e saída, erros e classes.",
    reason:
      "é uma referência direta da linguagem e funciona bem tanto como trilha inicial quanto para consultas posteriores.",
    href: "https://docs.python.org/pt-br/3/tutorial/",
    tags: ["Python", "Fundamentos", "Referência"],
  },
  {
    name: "Criar aplicativos .NET com C#",
    category: "Curso",
    description:
      "Roteiro introdutório da Microsoft Learn com exercícios de sintaxe C#, depuração, dependências e criação de aplicações .NET.",
    reason:
      "combina conceitos essenciais com prática guiada e prepara uma base consistente para projetos maiores.",
    href: "https://learn.microsoft.com/pt-br/training/paths/build-dotnet-applications-csharp/",
    tags: ["C#", ".NET", "Iniciante"],
  },
];
