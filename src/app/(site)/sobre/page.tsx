import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import {
  ArrowRightIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/ui/icons";
import { PageIntro } from "@/components/ui/page-intro";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Sobre Alef Cantero",
  description:
    "Conheça Alef Cantero, autor do CanteroLab, e o propósito por trás deste blog técnico.",
  path: "/sobre",
});

const purposeItems = [
  {
    index: "01",
    title: "O motivo",
    description:
      "Na rotina com tecnologia, muita coisa só fica clara depois de testar, errar e corrigir. Criei o blog para não deixar esses aprendizados se perderem quando uma tarefa termina.",
  },
  {
    index: "02",
    title: "O objetivo",
    description:
      "Construir um acervo prático e em constante evolução, explicando o contexto, as decisões e o caminho até uma solução que outras pessoas também possam aplicar.",
  },
  {
    index: "03",
    title: "O compromisso",
    description:
      "Compartilhar conteúdo direto, honesto e fácil de entender — incluindo os testes que falharam e os detalhes que fizeram a diferença no resultado final.",
  },
];

const topics = [
  "SQL Server",
  "Banco de dados",
  "Python",
  "C# e .NET",
  "Automação",
  "Projetos reais",
];

const socialLinks = [
  {
    label: "GitHub",
    href: siteConfig.links.github ?? "https://github.com/DBCantero",
    icon: <GithubIcon />,
  },
  {
    label: "LinkedIn",
    href:
      siteConfig.links.linkedin ??
      "https://www.linkedin.com/in/alef-cantero-5b9916158",
    icon: <LinkedinIcon />,
  },
  {
    label: "Instagram",
    href: siteConfig.links.instagram ?? "https://www.instagram.com/alefcantero",
    icon: <InstagramIcon />,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        kicker="$ whoami"
        title="Olá, eu sou Alef Cantero."
        description="Desenvolvedor de Backend & Dados, com foco em SQL Server, C# (.NET) e Python. Criei o CanteroLab para transformar aprendizados do dia a dia em conteúdo útil, direto e fácil de aplicar."
      />

      <section className="about-section" aria-labelledby="about-story-heading">
        <Container className="about-profile">
          <figure className="about-author-card">
            <div className="about-portrait-frame">
              <Image
                className="about-portrait"
                src="/images/authors/alef-cantero.webp"
                alt="Retrato de Alef Cantero"
                width={460}
                height={460}
                sizes="(max-width: 345px) 200px, (max-width: 414px) 58vw, 240px"
              />
            </div>
            <figcaption className="about-author-caption">
              <span>Autor do CanteroLab</span>
              <strong>Alef Cantero</strong>
              <p>Backend, dados e desenvolvimento.</p>
              <nav className="about-socials" aria-label="Redes sociais de Alef Cantero">
                {socialLinks.map((item) =>
                  item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${item.label} de Alef Cantero — abre em nova aba`}
                    >
                      {item.icon}
                    </a>
                  ) : (
                    <span
                      className="is-unconfigured"
                      key={item.label}
                      role="img"
                      aria-label={item.label}
                    >
                      {item.icon}
                    </span>
                  ),
                )}
              </nav>
            </figcaption>
          </figure>

          <div className="about-story">
            <p className="page-kicker">Por trás do laboratório</p>
            <h2 id="about-story-heading">
              Gosto de entender como as coisas funcionam — e de registrar o
              caminho até a solução.
            </h2>
            <p>
              Meu trabalho e meus estudos passam por banco de dados,
              desenvolvimento e automação. No dia a dia, investigo problemas,
              testo hipóteses, construo projetos e aprendo com aquilo que não
              funciona de primeira.
            </p>
            <p>
              O CanteroLab é o lugar onde organizo esse processo e compartilho
              o que aprendo. A ideia não é mostrar apenas a resposta pronta,
              mas também o raciocínio, os erros e as escolhas que levaram até
              ela.
            </p>
            <p className="about-statement">
              Aprender, construir, testar, corrigir e compartilhar.
            </p>
          </div>
        </Container>
      </section>

      <section className="about-purpose" aria-labelledby="about-purpose-heading">
        <Container>
          <header className="about-section-heading">
            <div>
              <p className="page-kicker">Por que o blog existe</p>
              <h2 id="about-purpose-heading">
                Conhecimento fica mais útil quando pode ser compartilhado.
              </h2>
            </div>
            <p>
              O CanteroLab nasceu como um caderno de trabalho aberto: um espaço
              para documentar experiências reais e transformá-las em referência
              para consultas futuras.
            </p>
          </header>

          <div className="about-purpose-grid">
            {purposeItems.map((item) => (
              <article className="about-purpose-card" key={item.index}>
                <span aria-hidden="true">{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="about-topics" aria-labelledby="about-topics-heading">
        <Container className="about-topics-layout">
          <div>
            <p className="page-kicker">O que você encontra aqui</p>
            <h2 id="about-topics-heading">
              Conteúdo técnico com contexto e aplicação prática.
            </h2>
            <p>
              O foco está nas tecnologias que fazem parte dos meus estudos e
              projetos, sempre com espaço para novas descobertas pelo caminho.
            </p>
            <Link className="button button-primary" href="/artigos">
              Explorar os artigos
              <ArrowRightIcon />
            </Link>
          </div>

          <ul className="about-topic-list" aria-label="Assuntos do CanteroLab">
            {topics.map((topic, index) => (
              <li key={topic}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {topic}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
