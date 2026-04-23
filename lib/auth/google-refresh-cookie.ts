import { CompactEncrypt, compactDecrypt } from "jose";
import { getJwtSecretKey } from "./auth-secret";

async function aes256GcmKeyFromSecret(): Promise<CryptoKey> {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", getJwtSecretKey() as BufferSource)
  );
  return crypto.subtle.importKey(
    "raw",
    digest.buffer.slice(digest.byteOffset, digest.byteOffset + digest.byteLength),
    { name: "AES-GCM", length: 256 },
    false,
    [
      "encrypt",
      "decrypt",
    ]
  );
}

export async function sealGoogleRefreshToken(refreshToken: string): Promise<string> {
  const key = await aes256GcmKeyFromSecret();
  return new CompactEncrypt(new TextEncoder().encode(refreshToken))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(key);
}

export async function unsealGoogleRefreshToken(jwe: string): Promise<string | null> {
  try {
    const key = await aes256GcmKeyFromSecret();
    const { plaintext } = await compactDecrypt(jwe, key);
    const s = new TextDecoder().decode(plaintext).trim();
    return s.length > 0 ? s : null;
  } catch {
    return null;
  }
}
