import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const target = url.searchParams.get("target") || (url.searchParams.get("admin") === "1" ? "studio" : "member");
  const filename = target === "studio" ? "NinaKurainStudio.mobileconfig" : "NinaKurain.mobileconfig";
  const filePath = path.join(process.cwd(), "public", "downloads", filename);

  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/x-apple-aspen-config; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
  } catch (e) {
    console.warn("Could not read local mobileconfig via fs:", e);
  }

  try {
    const assetRes = await fetch(new URL(`/downloads/${filename}`, url.origin));
    if (assetRes.ok) {
      const buffer = await assetRes.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/x-apple-aspen-config; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
  } catch (err) {
    console.warn("Could not fetch remote mobileconfig:", err);
  }

  return NextResponse.redirect(new URL(`/downloads/${filename}`, url.origin), 302);
}
