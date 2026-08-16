import Link from "next/link";

import { logoutAdminAction } from "@/app/admin/actions";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ArrowUpRightIcon, LogOutIcon } from "@/components/ui/icons";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">
        Pular para o conteúdo
      </a>
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link
            aria-label="CanteroLab — painel editorial"
            className="admin-brand"
            href="/admin"
          >
            <BrandLogo />
            <span className="admin-brand-context" aria-hidden="true">
              Editor
            </span>
          </Link>

          <AdminNavigation />

          <div className="admin-topbar-actions">
            <Link
              aria-label="Ver blog"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRightIcon />
              <span>Ver blog</span>
            </Link>
            <form action={logoutAdminAction}>
              <button type="submit" aria-label="Sair">
                <LogOutIcon />
                <span>Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="admin-workspace">
        <main className="admin-content" id="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
