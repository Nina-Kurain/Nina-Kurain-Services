import { requireAccount } from "@/lib/server/auth";
import { notFound } from "next/navigation";
import { Studio } from "../live-studio";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{section:string[]}>}){const {section}=await params;const path=section.join("/");const views:Record<string,string>={profile:"profile",posts:"posts","posts/new":"new",editor:"editor",stories:"stories",media:"media",members:"members",memberships:"plans",payments:"payments",settings:"settings",comments:"comments",feedback:"feedback"};if(!views[path])notFound();return <Protected view={views[path]}/>;}
async function Protected({view}:{view:string}){await requireAccount(true);return <Studio view={view}/>;}
