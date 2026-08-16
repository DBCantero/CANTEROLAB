import Link from "next/link";

import {
  GithubIcon,
  LinkedinIcon,
  MailIcon,
} from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const socialLinks = [
    {
      label: "GitHub",
      href: siteConfig.links.github,
      icon: <GithubIcon />,
    },
    {
      label: "LinkedIn",
      href: siteConfig.links.linkedin,
      icon: <LinkedinIcon />,
    },
    { label: "E-mail", href: siteConfig.links.email, icon: <MailIcon /> },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href));

  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" href="/" aria-label="CanteroLab — página inicial">
              <BrandLogo />
            </Link>
            <p>Código, dados e experiências do dia a dia.</p>
          </div>

          <nav className="footer-nav" aria-label="Navegação do rodapé">
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          {socialLinks.length > 0 ? (
            <nav className="footer-socials" aria-label="Redes e contato">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  aria-label={
                    item.href.startsWith("mailto:")
                      ? item.label
                      : `${item.label} — abre em nova aba`
                  }
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Cantero. Feito com código e café.</p>
          <code aria-label="Aprendendo e construindo">
            echo &quot;aprendendo &amp;&amp; construindo&quot;
          </code>
        </div>
      </Container>
    </footer>
  );
}
