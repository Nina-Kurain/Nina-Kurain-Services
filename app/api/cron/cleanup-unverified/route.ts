import { env } from "cloudflare:workers";
import { json } from "@/lib/server/db";
import { purgeAllDeletedAndExpiredUsers } from "@/lib/server/auth";

export async function POST(request: Request) {
  if (
    !env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`
  ) {
    return json({ message: "Unauthorized." }, 401);
  }

  const result = await purgeAllDeletedAndExpiredUsers();
  return json({
    ok: true,
    ...result,
    timestamp: Date.now(),
  });
}

export async function GET(request: Request) {
  return POST(request);
}
