"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section className="admin-missing">
      <p className="admin-eyebrow">Painel indisponível</p>
      <h1>Não foi possível carregar os artigos.</h1>
      <p>
        Verifique a conexão e as variáveis do repositório na hospedagem. Nenhum
        conteúdo foi alterado.
      </p>
      <button className="admin-button admin-button-primary" type="button" onClick={reset}>
        Tentar novamente
      </button>
    </section>
  );
}
