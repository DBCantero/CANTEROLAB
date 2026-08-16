import Link from "next/link";
import { redirect } from "next/navigation";

import { GithubIcon } from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";
import { isAdminAuthConfigured } from "@/lib/admin/config";
import { getAdminSession } from "@/lib/admin/session";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const loginErrors: Record<string, string> = {
  config: "O acesso ainda não foi configurado no servidor.",
  forbidden: "Esta conta do GitHub não tem acesso ao painel.",
  github: "O GitHub não concluiu a autenticação. Tente novamente.",
  oauth: "A tentativa de entrada expirou ou é inválida. Tente novamente.",
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await getAdminSession()) redirect("/admin");

  const { error } = await searchParams;
  const configured = isAdminAuthConfigured();
  const errorMessage = error ? loginErrors[error] : undefined;

  return (
    <main className="admin-login-page" id="conteudo">
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <Link className="admin-brand" href="/">
          <BrandLogo />
        </Link>
        <p className="admin-eyebrow">Painel editorial</p>
        <h1 id="admin-login-title">Entre para administrar o blog.</h1>
        <p className="admin-login-copy">
          Crie rascunhos, revise o conteúdo e envie novas publicações usando
          sua conta autorizada do GitHub.
        </p>

        {errorMessage ? (
          <p className="admin-alert admin-alert-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {configured ? (
          <a className="admin-button admin-button-primary" href="/api/admin/auth/github">
            <GithubIcon />
            Entrar com GitHub
          </a>
        ) : (
          <div className="admin-alert" role="status">
            <strong>Painel aguardando configuração</strong>
            <span>
              Configure as variáveis do GitHub e da sessão na hospedagem para
              liberar o acesso.
            </span>
          </div>
        )}

        <Link className="admin-back-link" href="/">
          ← Voltar ao blog
        </Link>
      </section>
    </main>
  );
}
