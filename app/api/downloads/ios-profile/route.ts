import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/downloads/NinaKurain.mobileconfig", url.origin), 307);
}
