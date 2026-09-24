import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Logout } from "./live-client";

export function AppHeader({ active, label = "FREE MEMBER" }: { active?: string; label?: string }) {
  return <header className="app-header"><Link href="/" className="wordmark" aria-label="Nina Kurain home"><BrandLogo height={48} width={72} priority /></Link><nav className="app-nav"><Link className={active === "feed" ? "active" : ""} href="/feed">Feed</Link><Link className={active === "memberships" ? "active" : ""} href="/memberships">Memberships</Link><Link className={active === "account" ? "active" : ""} href="/account/membership">My account</Link><Link className={active === "admin" ? "active" : ""} href="/admin">Creator studio</Link></nav><div className="header-actions"><span className="member-chip">{label}</span><Logout /></div></header>;
}
