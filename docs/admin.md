# Painel editorial do CanteroLab

O painel fica em `/admin` e foi desenhado para um único administrador. O login usa sua conta do GitHub; somente o ID numérico configurado recebe acesso.

## Como a publicação funciona

1. Você entra em `/admin` com o GitHub.
2. Cria ou edita o artigo no navegador.
3. O servidor valida os campos, restringe o MDX e processa a imagem social.
4. Artigo, imagem e eventual troca de destaque entram em um único commit.
5. A integração GitHub da hospedagem inicia um novo deploy.
6. O artigo aparece no blog quando o deploy termina.

Rascunhos também são salvos no repositório, com `published: false`. Se o repositório for público, o arquivo do rascunho será visível no GitHub mesmo sem aparecer no blog.

## 1. Preparar o repositório e a hospedagem

- Crie um repositório no GitHub e envie este projeto para a branch que será publicada.
- Importe o repositório em uma hospedagem compatível com Next.js, como a Vercel.
- Ative o deploy automático para a branch escolhida.
- Configure `SITE_URL` e `ADMIN_BASE_URL` com a URL HTTPS final, sem caminho adicional.

O admin não chama um deploy hook separado. O próprio commit dispara o deploy pela integração do GitHub.

## 2. Criar o login do GitHub

No GitHub, abra **Settings → Developer settings → OAuth Apps → New OAuth App**.

Preencha:

- **Homepage URL:** `https://seu-dominio.com.br`
- **Authorization callback URL:** `https://seu-dominio.com.br/api/admin/auth/github/callback`

Copie o Client ID e gere um Client Secret. Salve-os apenas nas variáveis protegidas da hospedagem:

```text
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
```

Descubra o ID numérico imutável da sua conta em `https://api.github.com/users/SEU-USUARIO` e configure:

```text
GITHUB_ADMIN_USER_ID=12345678
```

O nome de usuário não é usado como autorização porque ele pode ser alterado.

## 3. Autorizar a gravação dos artigos

Crie um **fine-grained personal access token** dedicado ao painel:

- limite o token somente ao repositório do blog;
- conceda apenas **Contents: Read and write**;
- escolha uma data de expiração e renove antes dela;
- nunca use o prefixo `NEXT_PUBLIC_`.

Configure na hospedagem:

```text
GITHUB_CONTENT_OWNER=seu-usuario
GITHUB_CONTENT_REPO=nome-do-repositorio
GITHUB_CONTENT_BRANCH=main
GITHUB_CONTENT_TOKEN=
```

## 4. Gerar os segredos internos

Execute uma vez no computador:

```bash
npm run admin:secrets
```

Copie os dois valores exibidos para as variáveis protegidas da hospedagem:

```text
ADMIN_SESSION_SECRET=
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=
```

Não salve os valores em arquivos versionados nem envie capturas de tela deles.

## 5. Variáveis completas

```text
SITE_URL=https://seu-dominio.com.br
ADMIN_BASE_URL=https://seu-dominio.com.br
ADMIN_SESSION_SECRET=
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
GITHUB_ADMIN_USER_ID=
GITHUB_CONTENT_OWNER=
GITHUB_CONTENT_REPO=
GITHUB_CONTENT_BRANCH=main
GITHUB_CONTENT_TOKEN=
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=
```

Depois de salvar as variáveis, faça um novo deploy e abra `https://seu-dominio.com.br/admin`.

## Desenvolvimento local

Sem as variáveis `GITHUB_CONTENT_*`, o painel usa os arquivos locais automaticamente. O login ainda exige uma OAuth App cujo callback local seja, por exemplo:

```text
http://127.0.0.1:3000/api/admin/auth/github/callback
```

Uma OAuth App aceita apenas uma callback principal. Para testar localmente sem alterar a configuração de produção, crie uma segunda OAuth App de desenvolvimento.

## Limites intencionais

- Categorias disponíveis: SQL Server, Python e C#.
- Imagem social: JPG, PNG ou WebP com até 3 MB; o servidor gera WebP em 1200 × 630.
- O editor aceita Markdown/GFM e `<Callout title="Nota">`, mas rejeita HTML, imports, expressões JavaScript e outros componentes.
- O endereço e a categoria ficam bloqueados após a criação para evitar links quebrados.
- Duas abas não podem sobrescrever silenciosamente o mesmo artigo: o painel pede atualização quando detecta conflito.
