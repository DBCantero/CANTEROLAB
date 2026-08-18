"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AwardIcon, FileTextIcon, PlusIcon } from "@/components/ui/icons";

const links = [
  {
    href: "/admin",
    icon: FileTextIcon,
    label: "Artigos",
    matches: (pathname: string) =>
      pathname === "/admin" ||
      (pathname.startsWith("/admin/artigos/") &&
        pathname !== "/admin/artigos/novo"),
  },
  {
    href: "/admin/artigos/novo",
    icon: PlusIcon,
    label: "Novo artigo",
    matches: (pathname: string) => pathname === "/admin/artigos/novo",
  },
  {
    href: "/admin/certificacoes",
    icon: AwardIcon,
    label: "Certificações",
    matches: (pathname: string) =>
      pathname === "/admin/certificacoes" ||
      (pathname.startsWith("/admin/certificacoes/") &&
        pathname !== "/admin/certificacoes/novo"),
  },
  {
    href: "/admin/certificacoes/novo",
    icon: PlusIcon,
    label: "Novo certificado",
    matches: (pathname: string) => pathname === "/admin/certificacoes/novo",
  },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="admin-navigation" aria-label="Navegação administrativa">
      {links.map((link) => {
        const active = link.matches(pathname);
        const Icon = link.icon;

        return (
          <Link
            className={active ? "is-active" : undefined}
            href={link.href}
            aria-current={active ? "page" : undefined}
            key={link.href}
          >
            <Icon />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
