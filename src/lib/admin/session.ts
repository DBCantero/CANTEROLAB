import "server-only";

import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminAuthConfig } from "@/lib/admin/config";

const SESSION_SECONDS = 8 * 60 * 60;

type AdminSession = {
  exp: number;
  iat: number;
  sub: string;
  v: 1;
};

export class AdminUnauthorizedError extends Error {
  constructor() {
    super("Sessão administrativa inválida.");
    this.name = "AdminUnauthorizedError";
  }
}

function sessionCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Host-canterolab-admin"
    : "canterolab-admin";
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function equalStrings(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return (
    leftBytes.length === rightBytes.length &&
    timingSafeEqual(leftBytes, rightBytes)
  );
}

function encodeSession(userId: string) {
  const { sessionSecret } = getAdminAuthConfig();
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSession = {
    exp: now + SESSION_SECONDS,
    iat: now,
    sub: userId,
    v: 1,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded, sessionSecret)}`;
}

function decodeSession(token: string | undefined): AdminSession | undefined {
  if (!token || token.length > 1024) return undefined;

  try {
    const { adminUserId, sessionSecret } = getAdminAuthConfig();
    const [encoded, signature, extra] = token.split(".");
    if (!encoded || !signature || extra) return undefined;

    const expected = sign(encoded, sessionSecret);
    if (!equalStrings(signature, expected)) return undefined;

    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<AdminSession>;
    const now = Math.floor(Date.now() / 1000);

    if (
      parsed.v !== 1 ||
      parsed.sub !== adminUserId ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number" ||
      parsed.iat > now + 60 ||
      parsed.exp <= now ||
      parsed.exp - parsed.iat > SESSION_SECONDS
    ) {
      return undefined;
    }

    return parsed as AdminSession;
  } catch {
    return undefined;
  }
}

export async function getAdminSession() {
  const token = (await cookies()).get(sessionCookieName())?.value;
  return decodeSession(token);
}

export function getAdminSessionCookie(userId: string) {
  return {
    name: sessionCookieName(),
    value: encodeSession(userId),
    httpOnly: true,
    maxAge: SESSION_SECONDS,
    path: "/",
    priority: "high",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  } as const;
}

export async function deleteAdminSession() {
  (await cookies()).delete(sessionCookieName());
}

export async function assertAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new AdminUnauthorizedError();
  return session;
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function createOAuthSecret() {
  return randomBytes(32).toString("base64url");
}

export function sessionCookieSettings(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    priority: "high" as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function constantTimeEqual(left: string, right: string) {
  return equalStrings(left, right);
}
