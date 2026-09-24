import { row } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customTxt = await row<{ value: string }>(
      "SELECT value FROM site_settings WHERE key='ads_txt_content'"
    );
    if (customTxt?.value?.trim()) {
      return new Response(customTxt.value.trim() + "\n", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const client = await row<{ value: string }>(
      "SELECT value FROM site_settings WHERE key='ads_adsense_client'"
    );

    if (client?.value?.trim()) {
      // Extract publisher ID (e.g. pub-1234567890123456 from ca-pub-1234567890123456)
      const cleanPub = client.value.replace(/^ca-/, "").trim();
      const defaultContent = `google.com, ${cleanPub}, DIRECT, f08c47fec0942fa0\n`;
      return new Response(defaultContent, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const fallbackClient = process.env.GOOGLE_ADSENSE_CLIENT || "ca-pub-9145564577500381";
    const cleanPub = fallbackClient.replace(/^ca-/, "").trim();
    return new Response(`google.com, ${cleanPub}, DIRECT, f08c47fec0942fa0\n`, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("# Error reading ads.txt\n", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
