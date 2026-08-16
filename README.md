# CANTEROLAB_

Site pessoal técnico, blog e laboratório de projetos construído com Next.js, TypeScript, CSS e MDX.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Conteúdo

- Artigos: `content/articles/<categoria>/<slug>.mdx`
- Projetos: `content/projects/`
- Dados estruturados: `src/data/`

Copie `.env.example` para `.env.local` e informe `SITE_URL` antes do deploy para gerar canonicals, Open Graph e sitemap corretos. Os links sociais são opcionais e só aparecem quando configurados.

Novos arquivos `.mdx` são descobertos automaticamente por categoria. O loader em `src/lib/articles.ts` valida o frontmatter, filtra rascunhos e gera slugs a partir dos nomes de arquivo.

## Painel editorial

O painel em `/admin` permite criar, editar, salvar rascunhos e publicar pelo navegador. Em desenvolvimento ele grava arquivos locais; em produção, cria um commit atômico no GitHub e aguarda o deploy da hospedagem.

Consulte [docs/admin.md](docs/admin.md) para configurar o login com GitHub, a credencial de conteúdo e a hospedagem.
