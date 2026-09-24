import { env } from "cloudflare:workers";
import { apiAccount } from "@/lib/server/auth";
import { endpoint, HttpError, row } from "@/lib/server/db";
import { verifyMedia } from "@/lib/server/media";
import { parseRange } from "@/lib/demo-files";
import { driveFileResponse } from "@/lib/server/google-drive";

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(async () => {
    const url = new URL(request.url),
      admin = url.searchParams.get("admin") === "1",
      { id } = await ctx.params;

    // First: Check if this asset belongs to a public published post or is public creator avatar
    let asset = await row<{ storage_key: string; mime: string; bytes: number }>(
      `SELECT ma.storage_key, ma.mime, ma.bytes 
       FROM media_assets ma 
       WHERE ma.id = ? 
         AND (
           EXISTS (
             SELECT 1 FROM post_media pm 
             JOIN posts p ON p.id = pm.post_id 
             WHERE pm.asset_id = ma.id 
               AND p.status IN ('published', 'scheduled') 
               AND (p.access_mode = 'free' OR p.visibility = 'free')
           )
           OR EXISTS (
             SELECT 1 FROM site_settings s 
             WHERE s.key IN ('creator_avatar_asset_id', 'creator_hero_asset_id') 
               AND s.value = ma.id
           )
         )`,
      id
    );

    let isPublic = Boolean(asset);

    // If not public, authenticate member/admin and verify signed token
    if (!asset) {
      const user = await apiAccount(admin, true);
      asset = await verifyMedia(user, id, url, admin);
      if (!asset) throw new HttpError(404, "Media unavailable.");
    }

    let range;
    try {
      range = parseRange(request.headers.get("range"), asset.bytes);
    } catch {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${asset.bytes}` },
      });
    }

    const headers = new Headers({
      "Content-Type": asset.mime,
      "Content-Length": String(range?.length ?? asset.bytes),
      "Cache-Control": isPublic ? "public, max-age=86400, s-maxage=604800" : "private, no-store",
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    });

    if (range) {
      headers.set("Content-Range", `bytes ${range.offset}-${range.offset + range.length - 1}/${asset.bytes}`);
    }

    if (asset.storage_key.startsWith("gdrive:")) {
      const response = await driveFileResponse(asset.storage_key.slice(7), request.headers.get("range"));
      if (response.status === 404) throw new HttpError(404, "Media unavailable.");
      if (!response.ok && response.status !== 206) throw new HttpError(502, "Google Drive could not deliver this media.");
      return new Response(response.body, { status: range ? 206 : 200, headers });
    }

    if (asset.storage_key.startsWith("public:")) {
      const fileUrl = new URL("/" + asset.storage_key.slice(7).replace(/^\//, ""), request.url);
      const res = await fetch(fileUrl.toString(), { headers: request.headers });
      if (res.ok || res.status === 206) return res;
    }

    if (!env.BUCKET) throw new HttpError(404, "Media unavailable.");
    const object = await env.BUCKET.get(asset.storage_key, range ? { range } : undefined);
    if (!object) throw new HttpError(404, "Media unavailable.");
    return new Response(object.body, { status: range ? 206 : 200, headers });
  });
}
