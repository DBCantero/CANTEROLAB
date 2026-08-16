import { randomBytes } from "node:crypto";

const sessionSecret = randomBytes(48).toString("base64url");
const actionsKey = randomBytes(32).toString("base64");

process.stdout.write(`
Segredos gerados para o painel administrativo.
Copie estas linhas para as variáveis protegidas da hospedagem:

ADMIN_SESSION_SECRET=${sessionSecret}
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=${actionsKey}

Não publique esses valores no GitHub e não use o prefixo NEXT_PUBLIC_.
`);
