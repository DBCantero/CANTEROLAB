import "server-only";

export class AdminConfigurationError extends Error {
  constructor(message = "O painel ainda não foi configurado para produção.") {
    super(message);
    this.name = "AdminConfigurationError";
  }
}

function value(name: string) {
  return process.env[name]?.trim() || undefined;
}

function requireValue(name: string) {
  const result = value(name);
  if (!result) throw new AdminConfigurationError();
  return result;
}

export function isAdminAuthConfigured() {
  return Boolean(
    value("ADMIN_SESSION_SECRET") &&
      value("GITHUB_OAUTH_CLIENT_ID") &&
      value("GITHUB_OAUTH_CLIENT_SECRET") &&
      value("GITHUB_ADMIN_USER_ID"),
  );
}

export function getAdminAuthConfig() {
  const sessionSecret = requireValue("ADMIN_SESSION_SECRET");
  const adminUserId = requireValue("GITHUB_ADMIN_USER_ID");

  if (sessionSecret.length < 32 || !/^\d+$/.test(adminUserId)) {
    throw new AdminConfigurationError();
  }

  return {
    adminUserId,
    clientId: requireValue("GITHUB_OAUTH_CLIENT_ID"),
    clientSecret: requireValue("GITHUB_OAUTH_CLIENT_SECRET"),
    sessionSecret,
  };
}

export function getAdminBaseUrl(requestUrl?: string) {
  const configured = value("ADMIN_BASE_URL") ?? value("SITE_URL");

  if (configured) {
    try {
      const url = new URL(configured);
      if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
        throw new AdminConfigurationError();
      }
      return url.origin;
    } catch {
      throw new AdminConfigurationError();
    }
  }

  if (process.env.NODE_ENV !== "production" && requestUrl) {
    return new URL(requestUrl).origin;
  }

  throw new AdminConfigurationError();
}

export function getGitHubContentConfig() {
  const branch = value("GITHUB_CONTENT_BRANCH") ?? "main";

  if (!/^[a-zA-Z0-9._/-]+$/.test(branch) || branch.includes("..")) {
    throw new AdminConfigurationError();
  }

  return {
    branch,
    owner: requireValue("GITHUB_CONTENT_OWNER"),
    repo: requireValue("GITHUB_CONTENT_REPO"),
    token: requireValue("GITHUB_CONTENT_TOKEN"),
  };
}

export function hasGitHubContentConfig() {
  return Boolean(
    value("GITHUB_CONTENT_OWNER") &&
      value("GITHUB_CONTENT_REPO") &&
      value("GITHUB_CONTENT_TOKEN"),
  );
}
