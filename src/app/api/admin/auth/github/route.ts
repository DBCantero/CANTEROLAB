import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import {
  getAdminAuthConfig,
  getAdminBaseUrl,
} from "@/lib/admin/config";
import {
  createOAuthSecret,
  sessionCookieSettings,
} from "@/lib/admin/session";

const STATE_COOKIE = "canterolab-oauth-state";
const VERIFIER_COOKIE = "canterolab-oauth-verifier";

export async function GET(request: Request) {
  try {
    const { clientId } = getAdminAuthConfig();
    const baseUrl = getAdminBaseUrl(request.url);
    const callbackUrl = `${baseUrl}/api/admin/auth/github/callback`;
    const state = createOAuthSecret();
    const verifier = createOAuthSecret();
    const challenge = createHash("sha256")
      .update(verifier)
      .digest("base64url");
    const authorizationUrl = new URL("https://github.com/login/oauth/authorize");

    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
    authorizationUrl.searchParams.set("scope", "read:user");
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");
    authorizationUrl.searchParams.set("allow_signup", "false");
    authorizationUrl.searchParams.set("prompt", "select_account");

    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set(STATE_COOKIE, state, sessionCookieSettings(10 * 60));
    response.cookies.set(
      VERIFIER_COOKIE,
      verifier,
      sessionCookieSettings(10 * 60),
    );
    return response;
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }
}
