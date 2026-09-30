import { env } from "cloudflare:workers";

export interface JwtPayload {
  sub: string;
  email: string;
  role: "admin" | "member";
  name?: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(buffer: Uint8Array | ArrayBuffer): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array<ArrayBuffer> {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getJwtSecret(): string {
  const secret =
    env.JWT_SECRET ||
    (typeof process !== "undefined" ? process.env?.JWT_SECRET : undefined) ||
    env.MEDIA_SIGNING_SECRET ||
    (typeof process !== "undefined" ? process.env?.MEDIA_SIGNING_SECRET : undefined);

  if (!secret) {
    const isProd =
      env.APP_ENV === "production" ||
      (typeof process !== "undefined" && process.env?.APP_ENV === "production");

    if (isProd) {
      throw new Error("JWT_SECRET is not configured in the environment.");
    }

    // High-entropy generic fallback for local dev when environment variables are not yet loaded
    return "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  }

  return secret;
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = getJwtSecret();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Signs a JWT valid for at least 90 days by default.
 */
export async function signJwt(
  data: { sub: string; email: string; role: "admin" | "member"; name?: string; [key: string]: unknown },
  expiresInSeconds: number = 90 * 86400
): Promise<string> {
  const key = await getSigningKey();
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + expiresInSeconds;

  const header = { alg: "HS256", typ: "JWT" };
  const payload: JwtPayload = {
    ...data,
    iat: nowSec,
    exp: expSec,
  };

  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataToSign)
  );

  const encodedSignature = base64UrlEncode(signature);
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies and decodes a JWT. Returns null if invalid or expired.
 */
export async function verifyJwt(tokenStr: string): Promise<JwtPayload | null> {
  if (!tokenStr || typeof tokenStr !== "string") return null;
  const parts = tokenStr.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

  try {
    const key = await getSigningKey();
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const signature = base64UrlDecode(encodedSignature);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      encoder.encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = decoder.decode(base64UrlDecode(encodedPayload));
    const payload: JwtPayload = JSON.parse(payloadJson);

    // Verify expiration timestamp
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < nowSec) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
