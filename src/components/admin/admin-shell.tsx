import Link from "next/link";

import { logoutAdminAction } from "@/app/admin/actions";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">
        Pular para o conteúdo
      </a>
      <aside className="admin-sidebar">
        <div>
          <Link className="admin-brand" href="/admin">
            CANTEROLAB<span aria-hidden="true">_</span>
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
          <Link className="admin-brand" href="/admin">
            CANTEROLAB<span aria-hidden="true">_</span>
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
