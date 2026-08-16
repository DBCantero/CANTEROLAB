export type ProjectStatus = "planejado" | "em-andamento" | "concluido";

export type Project = {
  title: string;
  description: string;
  status: ProjectStatus;
  stack: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    title: "Sentinel MSIT",
    description:
      "Um projeto pessoal para observar instâncias SQL Server e transformar sinais dispersos em contexto útil.",
    status: "em-andamento",
    stack: ["SQL Server", "Python", ".NET"],
  },
];

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planejado: "Planejado",
  "em-andamento": "Em andamento",
  concluido: "Concluído",
};
