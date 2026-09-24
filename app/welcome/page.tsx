import Link from "@/components/site-link";
import { requireAccount } from "@/lib/server/auth";
export const dynamic="force-dynamic";
export default async function Page(){const user=await requireAccount();return <main className="welcome"><section className="welcome-card"><span className="section-kicker">WELCOME, {user.display_name}</span><h1>Your free access is ready.</h1><p>Discover the creator’s selected free photographs and films. Explore memberships whenever you want to come closer.</p><div className="welcome-actions"><Link href="/feed" className="button">VIEW FREE CONTENT</Link><Link href="/memberships" className="button quiet-button">VIEW MEMBERSHIPS</Link></div></section></main>;}
