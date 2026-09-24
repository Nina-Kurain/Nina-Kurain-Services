import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Database, Network, ShieldCheck, ExternalLink, ArrowRight, Code2 } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema, getPersonSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — Official Entity Graph & Schema Dossier",
  description:
    "Authoritative Knowledge Graph entity definition for Nina Kurain, Digital Creator. Structured data, canonical identifiers, sameAs mappings, and technical schema.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/entity`,
  },
  openGraph: {
    title: "Nina Kurain — Official Entity Graph & Schema Dossier",
    description: "Authoritative Knowledge Graph entity definition for Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/entity`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-kurain-og.jpg", width: 1376, height: 768, alt: "Nina Kurain Entity Dossier" }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function EntityPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/entity`;

  const sameAsList = [
    settings.instagram || NINA_ENTITY.instagramUrl,
    settings.pinterest || NINA_ENTITY.pinterestUrl,
    settings.facebook || NINA_ENTITY.facebookUrl,
    settings.youtube || NINA_ENTITY.youtubeUrl,
    settings.x || "https://x.com/ninakurain",
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${creatorName} Knowledge Graph Entity`,
        description: `Canonical Schema.org definition and linked data dossier for ${creatorName}.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getPersonSchema(),
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Entity Dossier", url: pageUrl },
      ]),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">KNOWLEDGE GRAPH SPECIFICATION</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain — Entity Graph
              </h1>
              <p>
                Canonical web identifiers, linked data mappings, and semantic schema establishing {creatorName} as an unambiguous Digital Creator entity.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ background: "var(--nk-surface-card)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-lg)", padding: "32px", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "20px" }}>
                <Network size={24} style={{ color: "var(--nk-rose)" }} />
                <h2 style={{ margin: 0, fontSize: "22px" }}>Canonical Entity Record</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <div style={{ padding: "16px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-sm)", border: "1px solid var(--nk-border-subtle)" }}>
                  <small style={{ color: "var(--nk-text-subtle)", textTransform: "uppercase", fontSize: "11px", fontWeight: 700 }}>Canonical URI (@id)</small>
                  <p style={{ margin: "6px 0 0", fontFamily: "monospace", fontSize: "13px", color: "var(--nk-rose-light)", wordBreak: "break-all" }}>
                    {NINA_ENTITY.id}
                  </p>
                </div>
                <div style={{ padding: "16px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-sm)", border: "1px solid var(--nk-border-subtle)" }}>
                  <small style={{ color: "var(--nk-text-subtle)", textTransform: "uppercase", fontSize: "11px", fontWeight: 700 }}>Entity Type</small>
                  <p style={{ margin: "6px 0 0", fontWeight: 700, fontSize: "14px" }}>
                    schema.org/Person • DigitalCreator
                  </p>
                </div>
                <div style={{ padding: "16px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-sm)", border: "1px solid var(--nk-border-subtle)" }}>
                  <small style={{ color: "var(--nk-text-subtle)", textTransform: "uppercase", fontSize: "11px", fontWeight: 700 }}>Primary Domain</small>
                  <p style={{ margin: "6px 0 0", fontSize: "14px" }}>
                    <a href="https://ninakurainservices.in/" style={{ color: "var(--nk-rose-light)" }}>ninakurainservices.in</a>
                  </p>
                </div>
                <div style={{ padding: "16px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-sm)", border: "1px solid var(--nk-border-subtle)" }}>
                  <small style={{ color: "var(--nk-text-subtle)", textTransform: "uppercase", fontSize: "11px", fontWeight: 700 }}>Patron Subdomain</small>
                  <p style={{ margin: "6px 0 0", fontSize: "14px" }}>
                    <a href="https://vip.ninakurainservices.in/" style={{ color: "var(--nk-rose-light)" }}>vip.ninakurainservices.in</a>
                  </p>
                </div>
              </div>

              <h3>Linked Data sameAs Mappings</h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10, margin: "16px 0 24px" }}>
                {sameAsList.map((url) => (
                  <li key={url} style={{ padding: "10px 14px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-sm)", border: "1px solid var(--nk-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <code style={{ fontSize: "13px", color: "var(--nk-text)" }}>{url}</code>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--nk-rose-light)", display: "flex", alignItems: "center", gap: 4, fontSize: "12px" }}>
                      <span>Verify</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--nk-border)" }}>
                <Link href="/biography" className="btn-secondary">
                  <span>Biography</span>
                  <ArrowRight size={13} />
                </Link>
                <Link href="/wiki" className="btn-secondary">
                  <span>Wikipedia Entry</span>
                  <ArrowRight size={13} />
                </Link>
                <Link href="/photos" className="btn-secondary">
                  <span>Photography Gallery</span>
                  <ArrowRight size={13} />
                </Link>
                <Link href="/pricing" className="btn-secondary">
                  <span>Memberships</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
