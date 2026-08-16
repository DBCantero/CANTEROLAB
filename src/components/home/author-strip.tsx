import Link from "next/link";

import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";

export function AuthorStrip() {
  return (
    <section className="author-section" aria-labelledby="author-heading">
      <Container className="author-strip">
        <div>
          <p className="blog-section-kicker">Quem escreve</p>
          <h2 id="author-heading">Sou {siteConfig.author}.</h2>
        </div>
        <p>
          Trabalho com banco de dados e tecnologia e uso este espaço para
          documentar problemas, testes, erros e descobertas do dia a dia.
        </p>
        <Link className="button button-secondary" href="/sobre">
          Conhecer o autor
          <ArrowRightIcon />
        </Link>
      </Container>
    </section>
  );
}
