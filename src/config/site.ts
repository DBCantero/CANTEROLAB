const configuredUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  configuredUrl ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")
).replace(/\/$/, "");

export const siteConfig = {
  name: "CANTEROLAB_",
  shortName: "CanteroLab",
  author: "Cantero",
  title: "CanteroLab — Código, dados e experiências do dia a dia",
  description:
    "Um laboratório pessoal sobre SQL Server, banco de dados, Python, C#, .NET, automação e tudo o que aparece pelo caminho.",
  url: siteUrl,
  locale: "pt_BR",
  nav: [
    { label: "Home", href: "/" },
    { label: "Artigos", href: "/artigos" },
    { label: "Lab", href: "/lab" },
    { label: "Projetos", href: "/projetos" },
    { label: "Certificações", href: "/certificacoes" },
    { label: "Recursos", href: "/recursos" },
    { label: "Sobre", href: "/sobre" },
  ],
  links: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL || null,
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || null,
    email: process.env.NEXT_PUBLIC_EMAIL
      ? `mailto:${process.env.NEXT_PUBLIC_EMAIL}`
      : null,
  },
} as const;
