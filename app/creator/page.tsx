import { requireAccount } from "@/lib/server/auth";
import CreatorClient from "./creator-client";
export const dynamic="force-dynamic";
export default async function CreatorPage(){await requireAccount();return <CreatorClient/>;}
