import { beginGoogleAuth } from "@/lib/server/google-auth";

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const authUrl = await beginGoogleAuth(origin);
    return Response.redirect(authUrl, 302);
  } catch (error) {
    console.error("Google Auth Start error:", error);
    const message = error instanceof Error ? error.message : "Could not initialize Google Sign-In";
    return new Response(
      `<!doctype html><html><body style="background:#160d14;color:#fff;font-family:sans-serif;padding:32px;">` +
        `<h2>Google Sign-In Unavailable</h2><p>${message}</p>` +
        `<p><a style="color:#e56b83;" href="/login">Return to Login</a></p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
