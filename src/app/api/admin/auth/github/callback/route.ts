import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  getAdminAuthConfig,
  getAdminBaseUrl,
} from "@/lib/admin/config";
import {
  constantTimeEqual,
  getAdminSessionCookie,
} from "@/lib/admin/session";

const STATE_COOKIE = "canterolab-oauth-state";
const VERIFIER_COOKIE = "canterolab-oauth-verifier";

type GitHubTokenResponse = {
  access_token?: string;
};

type GitHubUserResponse = {
  id?: number;
};

function loginRedirect(request: Request, error: string) {
  return NextResponse.redirect(
    new URL(`/admin/login?error=${encodeURIComponent(error)}`, request.url),
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(STATE_COOKIE)?.value;
  const verifier = cookieStore.get(VERIFIER_COOKIE)?.value;

  if (
    !code ||
    !state ||
    !savedState ||
    !verifier ||
    !constantTimeEqual(state, savedState)
  ) {
    return loginRedirect(request, "oauth");
  }

  try {
    const { adminUserId, clientId, clientSecret } = getAdminAuthConfig();
    const baseUrl = getAdminBaseUrl(request.url);
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          code_verifier: verifier,
          redirect_uri: `${baseUrl}/api/admin/auth/github/callback`,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    const tokenData = (await tokenResponse.json()) as GitHubTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
      return loginRedirect(request, "github");
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenData.access_token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const user = (await userResponse.json()) as GitHubUserResponse;

    if (!userResponse.ok || String(user.id) !== adminUserId) {
      return loginRedirect(request, "forbidden");
    }

    const response = NextResponse.redirect(new URL("/admin", request.url));
    const sessionCookie = getAdminSessionCookie(adminUserId);
    const { name, value, ...options } = sessionCookie;
    response.cookies.set(name, value, options);
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(VERIFIER_COOKIE);
    return response;
  } catch {
    return loginRedirect(request, "github");
  }
}
