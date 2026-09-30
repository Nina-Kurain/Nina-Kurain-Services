import { env } from "cloudflare:workers";
import { apiAccount } from "@/lib/server/auth";
import { endpoint, HttpError, row } from "@/lib/server/db";
import { verifyMedia } from "@/lib/server/media";
import { parseRange } from "@/lib/demo-files";
import { driveFileResponse } from "@/lib/server/google-drive";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Authorization, Content-Type",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
      "Access-Control-Max-Age": "86400",
    },
  });
}

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

    const rangeHeader = request.headers.get("range");
    let range: { offset: number; length: number } | null = null;
    const totalBytes = Number(asset.bytes) || 0;

    if (rangeHeader && totalBytes > 0) {
      try {
        range = parseRange(rangeHeader, totalBytes);
      } catch {
        return new Response(null, {
          status: 416,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Range": `bytes */${totalBytes}`,
          },
        });
      }
    }

    const headers = new Headers({
      "Content-Type": asset.mime || "video/mp4",
      "Cache-Control": isPublic ? "public, max-age=86400, s-maxage=604800" : "private, no-store",
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Authorization, Content-Type",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
    });

    if (range && totalBytes > 0) {
      headers.set("Content-Range", `bytes ${range.offset}-${range.offset + range.length - 1}/${totalBytes}`);
      headers.set("Content-Length", String(range.length));
    } else if (totalBytes > 0) {
      headers.set("Content-Length", String(totalBytes));
    }

    if (asset.storage_key.startsWith("gdrive:")) {
      const response = await driveFileResponse(asset.storage_key.slice(7), rangeHeader);
      if (response.status === 404) throw new HttpError(404, "Media unavailable.");
      if (!response.ok && response.status !== 206) throw new HttpError(502, "Google Drive could not deliver this media.");
      
      const driveHeaders = new Headers(headers);
      const driveContentRange = response.headers.get("content-range");
      const driveContentLength = response.headers.get("content-length");
      if (driveContentRange) driveHeaders.set("Content-Range", driveContentRange);
      if (driveContentLength) driveHeaders.set("Content-Length", driveContentLength);

      return new Response(response.body, { status: response.status === 206 || range ? 206 : 200, headers: driveHeaders });
    }

    if (asset.storage_key.startsWith("public:")) {
      const fileUrl = new URL("/" + asset.storage_key.slice(7).replace(/^\//, ""), request.url);
      const res = await fetch(fileUrl.toString(), { headers: request.headers });
      if (res.ok || res.status === 206) {
        const publicHeaders = new Headers(res.headers);
        publicHeaders.set("Access-Control-Allow-Origin", "*");
        return new Response(res.body, { status: res.status, headers: publicHeaders });
      }
    }

    if (!env.BUCKET) throw new HttpError(404, "Media unavailable.");
    const object = await env.BUCKET.get(asset.storage_key, range ? { range } : undefined);
    if (!object) throw new HttpError(404, "Media unavailable.");
    return new Response(object.body, { status: range ? 206 : 200, headers });
  });
}
