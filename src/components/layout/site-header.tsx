"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  CloseIcon,
  GithubIcon,
  MenuIcon,
} from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const headerNav = siteConfig.nav.filter(
  (item) => item.href !== "/recursos",
);

function isCurrentPath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="CanteroLab — página inicial">
          <BrandLogo />
        </Link>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {headerNav.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "nav-link",
                isCurrentPath(pathname, item.href) && "is-active",
              )}
              href={item.href}
              aria-current={
                isCurrentPath(pathname, item.href) ? "page" : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {siteConfig.links.github ? (
            <a
              className="icon-link desktop-social"
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label={`GitHub de ${siteConfig.author} — abre em nova aba`}
            >
              <GithubIcon />
            </a>
          ) : null}
          <button
            ref={menuButtonRef}
            className="menu-button"
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={cn("mobile-nav", isOpen && "is-open")}
        aria-label="Navegação móvel"
        aria-hidden={!isOpen}
      >
        <div className="mobile-nav-inner">
          {headerNav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
              aria-current={
                isCurrentPath(pathname, item.href) ? "page" : undefined
              }
            >
              <span className="mobile-nav-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </Link>
          ))}
          {siteConfig.links.github ? (
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
            >
              <GithubIcon /> GitHub
            </a>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
