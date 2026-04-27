import { SignJWT, jwtVerify } from "jose";
import { getJwtSecretKey } from "./auth-secret";

export const NSK_SESSION_COOKIE_NAME = "nsk_session";

const SESSION_KIND_CLAIM = "nsk_sess";
const ANONYMOUS = "anon";
const GOOGLE = "google";

export type VerifiedSession =
  | { kind: "anonymous" }
  | { kind: "google"; sub: string; email?: string; name?: string; picture?: string };

/** Keep JWT small for the session cookie (browser ~4KB per cookie). */
const MAX_GOOGLE_NAME_IN_JWT = 100;
/** Google avatar URLs are often long; stay under typical 4KB cookie limits with room for other claims. */
const MAX_GOOGLE_PICTURE_URL_IN_JWT = 800;

export async function signAnonymousSessionJwt(): Promise<string> {
  const secret = getJwtSecretKey();
  return new SignJWT({ [SESSION_KIND_CLAIM]: ANONYMOUS, v: 1 })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function signGoogleSessionJwt(
  sub: string,
  opts?: { email?: string; name?: string; picture?: string }
): Promise<string> {
  const secret = getJwtSecretKey();
  const body: Record<string, unknown> = {
    [SESSION_KIND_CLAIM]: GOOGLE,
    v: 1,
    sub,
  };
  if (opts?.email) body.email = opts.email;
  if (opts?.name) body.gname = opts.name.trim().slice(0, MAX_GOOGLE_NAME_IN_JWT);
  if (opts?.picture) body.gpic = opts.picture.trim().slice(0, MAX_GOOGLE_PICTURE_URL_IN_JWT);
  return new SignJWT(body)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionJwt(token: string | undefined): Promise<VerifiedSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    if (payload[SESSION_KIND_CLAIM] === ANONYMOUS) {
      return { kind: "anonymous" };
    }
    if (payload[SESSION_KIND_CLAIM] === GOOGLE) {
      const sub = typeof payload.sub === "string" ? payload.sub : "";
      if (!sub) return null;
      const email = typeof payload.email === "string" ? payload.email : undefined;
      const name = typeof payload.gname === "string" ? payload.gname : undefined;
      const picture = typeof payload.gpic === "string" ? payload.gpic : undefined;
      return { kind: "google", sub, email, name, picture };
    }
    return null;
  } catch {
    return null;
  }
}
