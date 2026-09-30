import { NextRequest, NextResponse } from "next/server";
import {
  CURRENT_REQUIRED_APP_VERSION,
  CURRENT_REQUIRED_VERSION_CODE,
  CURRENT_APP_RELEASE_DATE,
  APP_DOWNLOADS,
  isAppVersionOutdated,
  parseAppVersionFromUserAgent,
} from "@/lib/app-version";

export const LATEST_VERSION = CURRENT_REQUIRED_APP_VERSION;
export const LATEST_VERSION_CODE = CURRENT_REQUIRED_VERSION_CODE;

export async function GET(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  const queryVersion = req.nextUrl.searchParams.get("v");
  const clientVersion = queryVersion || parseAppVersionFromUserAgent(ua) || (ua.includes("NinaKurainApp") ? "1.0.0" : null);

  const isOutdated = clientVersion ? isAppVersionOutdated(clientVersion) : false;

  return NextResponse.json(
    {
      latestVersion: CURRENT_REQUIRED_APP_VERSION,
      versionCode: CURRENT_REQUIRED_VERSION_CODE,
      requiredVersion: CURRENT_REQUIRED_APP_VERSION,
      releaseDate: CURRENT_APP_RELEASE_DATE,
      mandatoryUpdate: true,
      alwaysRequireLatest: true,
      clientVersion,
      isOutdated,
      message: `The latest version (v${CURRENT_REQUIRED_APP_VERSION}) is strictly required to access Nina Kurain.`,
      downloads: APP_DOWNLOADS,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
