import { SignJWT, jwtVerify } from "jose";
import { getJwtSecretKey } from "./auth-secret";

export const NSK_SESSION_COOKIE_NAME = "nsk_session";

const SESSION_KIND_CLAIM = "nsk_sess";
const ANONYMOUS = "anon";

export type VerifiedSession = { kind: "anonymous" };

export async function signAnonymousSessionJwt(): Promise<string> {
  const secret = getJwtSecretKey();
  return new SignJWT({ [SESSION_KIND_CLAIM]: ANONYMOUS, v: 1 })
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
    return null;
  } catch {
    return null;
  }
}
