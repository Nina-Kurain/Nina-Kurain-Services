import { requireAccount } from "@/lib/server/auth";
import { AccountPage } from "../../live-client";
export const dynamic="force-dynamic";
export default async function Page(){await requireAccount();return <AccountPage membershipOnly/>;}
