import { Container } from "@/components/ui/container";

type PageIntroProps = {
  kicker: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageIntro({
  kicker,
  title,
  description,
  children,
}: PageIntroProps) {
  return (
    <section className="page-intro">
      <Container>
        <p className="page-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p className="page-intro-description">{description}</p>
        {children}
      </Container>
    </section>
  );
}
