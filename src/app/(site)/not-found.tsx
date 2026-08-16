import Link from "next/link";

import { ArrowRightIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <section className="not-found">
      <Container>
        <p className="page-kicker">erro 404</p>
        <h1>Este registro não está no Lab.</h1>
        <p>O endereço pode ter mudado ou o conteúdo ainda não foi publicado.</p>
        <Link className="button button-primary" href="/">
          Voltar para a Home <ArrowRightIcon />
        </Link>
      </Container>
    </section>
  );
}
