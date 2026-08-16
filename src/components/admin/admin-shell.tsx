import Link from "next/link";

import { logoutAdminAction } from "@/app/admin/actions";
import { BrandLogo } from "@/components/ui/brand-logo";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">
        Pular para o conteúdo
      </a>
      <aside className="admin-sidebar">
        <div>
          <Link className="admin-brand" href="/admin">
            <BrandLogo />
          </Link>
          <p>Painel editorial</p>
        </div>
        <nav aria-label="Navegação administrativa">
          <Link href="/admin">Artigos</Link>
          <Link href="/admin/artigos/novo">Novo artigo</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" target="_blank">
            Ver blog <span aria-hidden="true">↗</span>
          </Link>
          <form action={logoutAdminAction}>
            <button type="submit">Sair</button>
          </form>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-mobile-header">
          <Link
            aria-label="CanteroLab — painel editorial"
            className="admin-brand"
            href="/admin"
          >
            <BrandLogo markOnly />
          </Link>
          <nav aria-label="Atalhos administrativos">
            <Link href="/admin">Artigos</Link>
            <Link href="/admin/artigos/novo">Novo</Link>
            <form action={logoutAdminAction}>
              <button type="submit">Sair</button>
            </form>
          </nav>
        </header>
        <main className="admin-content" id="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
