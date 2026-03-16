import { createHmac } from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET || "default-dev-secret-change-in-production";
const SESSION_COOKIE = "sf_session";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(userId: string): string {
  const expires = Date.now() + SEVEN_DAYS;
  const payload = `${userId}.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [userId, expires, signature] = parts;
    const payload = `${userId}.${expires}`;
    const expected = sign(payload);
    if (signature !== expected) return null;
    if (Date.now() > parseInt(expires)) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const session = (cookieStore as any).get(SESSION_COOKIE);
    if (!session?.value) return null;
    return verifySessionToken(session.value);
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SEVEN_DAYS };
