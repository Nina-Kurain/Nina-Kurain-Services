import { requireAccount } from "@/lib/server/auth";
import { Feed } from "../live-client";
export const dynamic="force-dynamic";
export default async function Page(){await requireAccount();return <Feed saved/>;}
