import { env } from "cloudflare:workers";
import { HttpError, row, run } from "./db";

type GoogleTokenReply = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

export type GoogleUserProfile = {
  id: string; // Google sub
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
};

const encoder = new TextEncoder();
const base64url = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
const random = (size = 32) => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
};
const sha256 = async (value: string) =>
  Buffer.from(await crypto.subtle.digest("SHA-256", encoder.encode(value))).toString("hex");

export function getGoogleClientId(): string | undefined {
  return env.GOOGLE_DRIVE_CLIENT_ID;
}

export function getGoogleClientSecret(): string | undefined {
  return env.GOOGLE_DRIVE_CLIENT_SECRET;
}

export function googleAuthConfigured(): boolean {
  return Boolean(getGoogleClientId() && getGoogleClientSecret() && env.APP_URL);
}

function googleRedirectUri(requestOrigin?: string): string {
  const base = requestOrigin || env.APP_URL || "https://ninakurainservices.in";
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}

/**
 * Initiates the Google OAuth 2.0 PKCE flow.
 * Returns the Google Authorization URL to redirect the user to.
 */
export async function beginGoogleAuth(requestOrigin?: string): Promise<string> {
  if (!googleAuthConfigured()) {
    throw new HttpError(
      503,
      "Google Sign-In is not configured yet. Please check back shortly or sign in with your email."
    );
  }

  const state = random(32);
  const verifier = random(64);
  const challenge = base64url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(verifier)))
  );
  const now = Date.now();
  const redirectUri = googleRedirectUri(requestOrigin);

  // Clean expired oauth states
  await run("DELETE FROM oauth_states WHERE expires_at <= ?", now);

  // Store in oauth_states table
  await run(
    "INSERT INTO oauth_states(state_hash, provider, code_verifier, created_by, expires_at, created_at) VALUES(?, 'google_login', ?, ?, ?, ?)",
    await sha256(state),
    verifier,
    redirectUri,
    now + 10 * 60000,
    now
  );

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: getGoogleClientId()!,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "online",
    prompt: "select_account",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();

  return url.toString();
}

/**
 * Completes the Google OAuth 2.0 flow using state and authorization code.
 * Validates the PKCE challenge, fetches tokens, and retrieves user profile.
 */
export async function finishGoogleAuth(
  state: string,
  code: string
): Promise<GoogleUserProfile> {
  if (!googleAuthConfigured()) {
    throw new HttpError(503, "Google Sign-In is not configured.");
  }

  const stateHash = await sha256(state);
  const saved = await row<{ code_verifier: string; created_by: string }>(
    "SELECT code_verifier, created_by FROM oauth_states WHERE state_hash = ? AND provider = 'google_login' AND expires_at > ?",
    stateHash,
    Date.now()
  );

  if (!saved) {
    throw new HttpError(400, "Google sign-in session expired or is invalid. Please try again.");
  }

  await run("DELETE FROM oauth_states WHERE state_hash = ?", stateHash);

  const redirectUri = saved.created_by?.startsWith("http") ? saved.created_by : googleRedirectUri();

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getGoogleClientId()!,
      client_secret: getGoogleClientSecret()!,
      code,
      code_verifier: saved.code_verifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const tokens = (await tokenRes.json()) as GoogleTokenReply;
  if (!tokenRes.ok || !tokens.access_token) {
    throw new HttpError(
      502,
      tokens.error_description || "Google authorization could not be completed. Please try again."
    );
  }

  // Fetch Google User Profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const profile = (await profileRes.json()) as {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    verified_email?: boolean;
  };

  if (!profileRes.ok || !profile.email || !profile.id) {
    throw new HttpError(502, "Could not retrieve user details from Google.");
  }

  return {
    id: profile.id,
    email: profile.email.toLowerCase().trim(),
    name: profile.name?.trim() || "Google Member",
    picture: profile.picture,
    verified_email: Boolean(profile.verified_email),
  };
}
