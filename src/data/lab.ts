export type LabStatus =
  | "planejado"
  | "estudando"
  | "em-andamento"
  | "pausado"
  | "concluido";

export type LabEntry = {
  title: string;
  description: string;
  status: LabStatus;
  detail: string;
};

export const labStatus: Record<
  LabStatus,
  { label: string; symbol: string; className: string }
> = {
  planejado: {
    label: "Planejado",
    symbol: "○",
    className: "status-neutral",
  },
  estudando: {
    label: "Estudando",
    symbol: "◐",
    className: "status-accent",
  },
  "em-andamento": {
    label: "Em andamento",
    symbol: "↻",
    className: "status-warning",
  },
  pausado: {
    label: "Pausado",
    symbol: "Ⅱ",
    className: "status-neutral",
  },
  concluido: {
    label: "Concluído",
    symbol: "✓",
    className: "status-success",
  },
};

export const labEntries: LabEntry[] = [
  {
    title: "Sentinel MSIT",
    description: "Monitoramento de instâncias SQL Server.",
    status: "em-andamento",
    detail: "projeto",
  },
  {
    title: "ETL com Python",
    description: "Extração, transformação e carga sem trabalho manual.",
    status: "concluido",
    detail: "experimento",
  },
  {
    title: "API .NET",
    description: "Explorando os fundamentos do ASP.NET Core.",
    status: "estudando",
    detail: "estudo",
  },
  {
    title: "CLI Tools",
    description: "Pequenas ferramentas para rotinas de terminal.",
    status: "planejado",
    detail: "ideia",
  },
];
