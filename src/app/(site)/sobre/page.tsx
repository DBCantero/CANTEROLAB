import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Sobre",
  description: "Sobre Cantero e a ideia por trás do CanteroLab.",
  path: "/sobre",
});

export default function AboutPage() {
  return (
    <>
      <PageIntro
        kicker="$ whoami"
        title="Sou Cantero."
        description="Trabalho com banco de dados e tecnologia, mas gosto principalmente de entender como as coisas funcionam."
      />
      <section className="about-section">
        <Container className="about-layout">
          <p className="about-pullquote">
            Aprendendo. Construindo. Quebrando. Corrigindo. Compartilhando.
          </p>
          <div className="about-copy">
            <p>
              O CanteroLab nasceu como um lugar para registrar meus
              aprendizados, projetos, erros e descobertas.
            </p>
            <p>
              Aqui você vai encontrar bastante SQL Server, Python, C#,
              automação e qualquer outra coisa que eu resolva explorar pelo
              caminho.
            </p>
            <p>
              Não é uma coleção de respostas definitivas. É um caderno de
              trabalho aberto: o problema que apareceu, a hipótese que parecia
              certa, o teste que falhou e o detalhe que finalmente fez sentido.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
