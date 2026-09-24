"use client";
import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { LayoutDashboard, FileImage, Users, Sparkles, CreditCard, Settings, ImagePlus, MessageCircle, MessageSquareText, Plus, Upload, Trash2, Pencil, ArrowRight, UserRound, Grid3X3, Clapperboard, Heart, Archive, Star, CirclePlay, Clock3, HardDrive, CloudUpload, Unplug, MailCheck, ShieldCheck, Globe2, IndianRupee, ExternalLink, Copy, CheckCircle2, Check, QrCode } from "lucide-react";
import { api, useData, State, Notice, Logout, download, CommentThread } from "../live-client";
import { ThemeQuickToggle, ThemeSelector } from "../theme-controls";
import { PrivateMediaMark, ProtectedImage, ProtectedVideo } from "@/components/protected-media";
import type { ContentPost, Plan } from "@/lib/server/entitlements";
import { getPlanPricing } from "@/lib/pricing";
import { PostViewer } from "@/components/post-viewer/post-viewer";
import { ReelViewer } from "@/components/post-viewer/reel-viewer";
import { NinaStudioEditor, MediaStudioTriggerBanner } from "@/components/media-editor/nina-studio-editor";
import { PaymentQrGenerator } from "@/components/admin/payment-qr-generator";
import { DatabaseStorageManager, formatBytes } from "@/components/admin/database-storage-manager";
const nav = [{ id: "overview", label: "Dashboard", path: "/admin", icon: LayoutDashboard }, { id: "profile", label: "Creator profile", path: "/admin/profile", icon: UserRound }, { id: "editor", label: "Studio Editor", path: "/admin/editor", icon: Sparkles }, { id: "posts", label: "Posts", path: "/admin/posts", icon: FileImage }, { id: "stories", label: "Stories", path: "/admin/stories", icon: CirclePlay }, { id: "media", label: "Media", path: "/admin/media", icon: ImagePlus }, { id: "members", label: "Members", path: "/admin/members", icon: Users }, { id: "plans", label: "Memberships", path: "/admin/memberships", icon: Sparkles }, { id: "payments", label: "Payments", path: "/admin/payments", icon: CreditCard }, { id: "comments", label: "Comments", path: "/admin/comments", icon: MessageCircle }, { id: "feedback", label: "Feedback", path: "/admin/feedback", icon: MessageSquareText }, { id: "settings", label: "Settings", path: "/admin/settings", icon: Settings }];
const money = (n: number) => `₹${n.toLocaleString("en-IN")}`; const date = (n: number | null) => n ? new Date(n).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
type Act = (path: string, value: unknown) => Promise<boolean>;
function Title({ title, copy, children }: { title: string; copy: string; children?: React.ReactNode }) { return <div className="demo-page-title"><div><span className="section-kicker">CREATOR STUDIO</span><h1>{title}</h1><p>{copy}</p></div><div className="live-toolbar">{children}</div></div>; }
function AdminCreatorProfile({ data, edit, archive, remove, removeComment, busy, onOpenEditor }: { data: any; edit: (post: ContentPost) => void; archive: (post: ContentPost) => Promise<boolean>; remove: (post: ContentPost) => void; removeComment: (id: string) => void; busy: boolean; onOpenEditor?: (files?: File[]) => void }) {
  const [tab, setTab] = useState<"demo" | "exclusive" | "reels" | "saved">("demo"), [planLevel, setPlanLevel] = useState(0), [selected, setSelected] = useState<ContentPost | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const posts = (data.posts ?? []) as ContentPost[], plans = (data.plans ?? []) as Plan[];

  useEffect(() => {
    if (typeof window === "undefined" || !posts.length) return;
    const urlPostId = new URLSearchParams(window.location.search).get("post");
    if (urlPostId) {
      const match = posts.find(p => p.id === urlPostId);
      if (match) setSelected(match);
    }
  }, [posts]);

  const handleClose = () => {
    setSelected(null);
    if (typeof window !== "undefined" && window.location.search.includes("post=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("post");
      window.history.replaceState(null, "", url.pathname + (url.search || ""));
    }
  };

  const visible = tab === "demo" ? posts : tab === "exclusive" ? posts.filter(p => p.access_mode !== "free" && (!planLevel || (p.access_mode === "level" ? p.minimum_level <= planLevel : p.plan_ids?.some(id => plans.find(plan => plan.id === id)?.level === planLevel)))) : tab === "reels" ? posts.filter(p => p.is_reel) : [];
  const creator = data.creator ?? { name: "Nina Kurain", bio: "A private collection of photographs, films and personal notes.", avatar: "/seductive-1.jpeg" };
  const handle = (creator.name ?? "ninakurain").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const togglePost = async (type: "save" | "like", p: ContentPost) => {
    if (toggleBusy) return; setToggleBusy(true);
    const next = !Boolean(p[type === "save" ? "saved" : "liked"]);
    try {
      await api(`/api/app/${type}`, { postId: p.id, selected: next });
      const updater = (prev: ContentPost) => ({ ...prev, [type === "save" ? "saved" : "liked"]: Number(next), like_count: type === "like" ? Math.max(0, (prev.like_count ?? 0) + (next ? 1 : -1)) : prev.like_count });
      setSelected(curr => curr?.id === p.id ? updater(curr) : curr);
      const idx = posts.findIndex(x => x.id === p.id); if (idx !== -1) posts[idx] = updater(posts[idx]);
    } catch (err) { console.error(err); } finally { setToggleBusy(false); }
  };
  return <section className="creator-profile admin-public-profile">
    <div className="admin-profile-toolbar"><span className="section-kicker">ADMIN PREVIEW</span><div className="live-toolbar">{onOpenEditor && <button type="button" className="profile-action editor-btn" onClick={() => onOpenEditor()}><Sparkles size={14} /> Open Studio Editor</button>}<Link className="profile-action" href="/admin/settings">Edit profile</Link><Link className="profile-action primary" href="/admin/posts/new"><Plus size={15} />New post</Link></div></div>
    <section className="creator-profile-head">
      <div className="creator-profile-top">
        <div className="creator-avatar"><img src={creator.avatar || "/nina-kurain-official-portrait.webp"} alt={creator.name} /></div>
        <div className="creator-profile-info">
          <div className="creator-profile-title">
            <div>
              <span className="section-kicker">CREATOR PROFILE</span>
              <div className="creator-badge-row">
                <h1>{creator.name}</h1>
                <span className="verified-creator-pill"><ShieldCheck size={13} /> Verified Creator</span>
              </div>
              <p className="creator-handle">@{handle || "ninakurain"}</p>
            </div>
          </div>
          <div className="creator-stats"><span><b>{posts.length}</b> posts</span><span><b>Public preview</b> access</span><span><b>Creator</b> community</span></div>
          <p className="creator-bio">{creator.bio}</p>
          <div className="profile-links"><span>Private archive</span><span>New drops monthly</span></div>
          {creator.socials && <div className="creator-social-links">{Object.entries(creator.socials).filter(([, url]) => Boolean(url)).map(([name, url]) => <a key={name} href={String(url)} target="_blank" rel="noopener noreferrer"><Globe2 size={15} /><span>{name}</span></a>)}</div>}
        </div>
      </div>
    </section>
    <div className="creator-studio-spotlight">
      <div className="spotlight-card">
        <div className="spotlight-left">
          <span className="spotlight-tag"><Sparkles size={14} /> Studio Media Suite</span>
          <h3>Craft Luxury Content &amp; Reels</h3>
          <p>Crop, color-grade, adjust tones, watermark, and craft carousel drops or video reels with the Nina Studio Editor.</p>
        </div>
        <div className="spotlight-actions">
          {onOpenEditor && <button type="button" className="button spotlight-primary-btn" onClick={() => onOpenEditor()}><Sparkles size={15} /> Launch Editor</button>}
          <Link className="button quiet-button spotlight-secondary-btn" href="/admin/editor">View Projects</Link>
        </div>
      </div>
    </div>
    <div className="profile-tabs" role="tablist" aria-label="Creator content"><button type="button" role="tab" aria-selected={tab === "demo"} className={tab === "demo" ? "active" : ""} onClick={() => setTab("demo")}><Grid3X3 size={17} /> DEMO</button><button type="button" role="tab" aria-selected={tab === "exclusive"} className={tab === "exclusive" ? "active" : ""} onClick={() => setTab("exclusive")}><Sparkles size={17} /> EXCLUSIVES</button><button type="button" role="tab" aria-selected={tab === "reels"} className={tab === "reels" ? "active" : ""} onClick={() => setTab("reels")}><Clapperboard size={17} /> REELS</button><button type="button" role="tab" aria-selected={tab === "saved"} className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}><span aria-hidden="true">▱</span> SAVED</button></div>
    {tab === "exclusive" && <div className="exclusive-filter"><label><span>Preview membership access</span><select value={planLevel} onChange={event => setPlanLevel(Number(event.target.value))}><option value={0}>All exclusives</option>{plans.filter(plan => plan.level > 0).map(plan => <option value={plan.level} key={plan.id}>{plan.name}</option>)}</select></label></div>}
    {tab === "saved" ? <div className="live-empty admin-profile-empty"><h2>Saved posts are member-owned.</h2><p>Use this creator profile to review demos, exclusives and reels. Member bookmarks remain private to each account.</p></div> : visible.length ? <div className="creator-grid">{visible.map(p => {
      const isFree = p.access_mode === "free";
      const planObj = plans.find(pl => pl.level === p.minimum_level);
      const planBadge = isFree ? "DEMO" : (planObj?.name || `Tier ${p.minimum_level}`);
      return (
        <button type="button" className="creator-tile" key={p.id} onClick={() => setSelected(p)} aria-label={`View ${p.is_reel ? "reel" : "post"}: ${p.title}`}>
          <div>
            {p.media?.[0]?.mime.startsWith("video/") ? <ProtectedVideo muted preload="metadata" src={p.media[0].url} /> : <ProtectedImage src={p.media?.[0]?.url} alt={p.title} loading="lazy" decoding="async" />}
            <span className="tile-overlay"><Heart size={17} fill="currentColor" />{p.like_count ?? 0}<MessageCircle size={17} />{p.comment_count ?? 0}</span>
            {p.is_reel && <span className="tile-reel"><Clapperboard size={17} /></span>}
            {p.media && p.media.length > 1 && <span className="tile-multi">▣</span>}
            <span className={`tile-admin-tier-badge ${isFree ? "demo-badge" : ""}`}>{isFree ? "DEMO" : `🔒 ${planBadge.toUpperCase()}`}</span>
          </div>
        </button>
      );
    })}</div> : <div className="live-empty admin-profile-empty"><h2>No content in this collection yet.</h2><p>Create a post or reel and select the appropriate access.</p><Link className="button" href="/admin/posts/new"><Plus size={16} />Create first post</Link></div>}
    {selected && (selected.is_reel ? <ReelViewer post={selected} avatar={creator.avatar} creatorName={creator.name} busy={busy || toggleBusy} message="" likesEnabled onClose={handleClose} onToggle={togglePost} admin onEdit={() => { setSelected(null); edit(selected); }} onArchive={async () => { if (await archive(selected)) setSelected(null); }} onDelete={() => { setSelected(null); remove(selected); }} onRemoveComment={removeComment} /> : <PostViewer post={selected} avatar={creator.avatar} creatorName={creator.name} busy={busy || toggleBusy} message="" likesEnabled onClose={handleClose} onToggle={togglePost} admin onEdit={() => { setSelected(null); edit(selected); }} onArchive={async () => { if (await archive(selected)) setSelected(null); }} onDelete={() => { setSelected(null); remove(selected); }} onRemoveComment={removeComment} />)}
  </section>;
}
export function Studio({ view = "overview" }: { view?: string }) {
  const main = view === "new" ? "posts" : view; const result = useData(main === "editor" ? "/api/studio/editor" : `/api/studio/${main}`); const plans = useData<{ plans: Plan[] }>("/api/studio/plans");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [editor, setEditor] = useState<ContentPost | null>(null), [member, setMember] = useState<any>(null), [confirm, setConfirm] = useState<{ title: string; copy: string; path: string; data: unknown } | null>(null);
  const [studioEditorOpen, setStudioEditorOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [studioEditorFiles, setStudioEditorFiles] = useState<File[]>([]);
  const [studioEditorMedia, setStudioEditorMedia] = useState<Array<{ id?: string; name: string; mime: string; url: string; editRecipe?: string }>>([]);
  const [existingProjectId, setExistingProjectId] = useState<string | undefined>(undefined);
  const [editorPendingCallback, setEditorPendingCallback] = useState<((assets: Asset[]) => void) | null>(null);
  const openStudioEditor = (files?: File[], projId?: string, onAssetsDone?: (assets: Asset[]) => void, mediaItems?: Array<{ id?: string; name: string; mime: string; url: string; editRecipe?: string }>) => {
    setStudioEditorFiles(files ?? []);
    setStudioEditorMedia(mediaItems ?? []);
    setExistingProjectId(projId);
    if (onAssetsDone) setEditorPendingCallback(() => onAssetsDone);
    else setEditorPendingCallback(null);
    setStudioEditorOpen(true);
  };
  async function act(path: string, data: unknown) { if (busy) return false; setBusy(true); setMessage(""); try { const r = await api(`/api/studio/${path}`, data); setMessage(r.message ?? "Saved."); await result.refresh(); if (path === "plan") await plans.refresh(); return true; } catch (e) { setMessage(e instanceof Error ? e.message : "Could not save. Please retry."); return false; } finally { setBusy(false); } }
  const d = result.data;
  return <main className="demo-app live-admin"><div className="demo-layout"><aside className="demo-sidebar"><div className="demo-brand"><Link href="/" className="wordmark" aria-label="Nina Kurain home"><BrandLogo height={44} width={66} priority /></Link><small>PRIVATE CREATOR STUDIO</small></div><nav aria-label="Admin navigation">{nav.map(n => <Link href={n.path} key={n.id} className={main === n.id ? "active" : ""}><n.icon size={18} />{n.label}</Link>)}</nav><div className="demo-side-card"><span className="demo-avatar">NK</span><div><strong>Creator account</strong><small>Authenticated admin</small></div></div><Link className="button quiet-button" href="/login">OPEN MEMBER VIEW<ArrowRight size={14} /></Link></aside><section className="demo-main"><header className="demo-topbar"><div><span>NINA KURAIN STUDIO</span><strong>Your private creative space.</strong></div><div className="header-actions"><Button type="button" className="topbar-editor-btn" onClick={() => setPaymentModalOpen(true)} style={{ background: "linear-gradient(135deg, #a92f49 0%, #d43b60 100%)", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}><QrCode size={14} /> Custom Payment QR</Button><Button type="button" className="topbar-editor-btn" onClick={() => openStudioEditor()}><Sparkles size={14} /> Studio Editor</Button><ThemeQuickToggle /><span className="live-updating">Live · refreshes within 6 seconds</span><Logout admin /></div><select className="live-drawer-nav" aria-label="Admin page" value={main} onChange={e => location.assign(nav.find(n => n.id === e.target.value)!.path)}>{nav.map(n => <option value={n.id} key={n.id}>{n.label}</option>)}</select></header><section className="demo-content admin-surface">{message && <Notice>{message}</Notice>}{view === "new" ? <><Title title="Create a post." copy="Share something with exactly the members you choose." /><section className="live-panel"><PostEditor plans={plans.data?.plans ?? []} act={act} busy={busy} close={() => location.assign("/admin/posts")} onLaunchEditor={openStudioEditor} /></section></> : !d ? <State loading={result.loading} error={result.error} retry={result.refresh} /> : <>
    {main === "overview" && <><Title title="Your studio, at a glance." copy="Live database totals. Complimentary memberships are access grants, not payment revenue."><Link className="button" href="/admin/posts/new"><Plus size={16} />NEW POST</Link></Title><div className="admin-metrics">{[["Total members", d.users.total_users], ["Active memberships", d.subscriptions.active_memberships ?? 0], ["Grace period", d.subscriptions.grace_memberships ?? 0], ["Expired memberships", d.subscriptions.expired_memberships ?? 0], ["Revenue this month", money(d.revenue.revenue / 100)], ["Published posts", d.stats.published_posts ?? 0], ["Drafts", d.stats.draft_posts ?? 0], ["Total posts", d.stats.total_posts]].map(([label, value]) => <article key={label}><p>{label}</p><strong>{value}</strong></article>)}</div><div className="live-grid"><section className="live-panel"><h2>Membership overview</h2>{d.members.map((m: any) => <div className="billing-row" key={m.id}><span>{m.name}</span><strong>{m.count}</strong></div>)}</section><section className="live-panel"><h2>Connection status</h2><p>Email delivery: <strong>{d.emailReady ? "Configured" : "Needs setup"}</strong></p><p>Razorpay: <strong>{d.billing?.ready ? `${String(d.billing.mode).toUpperCase()} ready` : "Needs setup"}</strong>{d.billing?.ready && <Link className="text-link" style={{ marginLeft: 8, color: "#e56b83", fontWeight: 600 }} href="/admin/settings#payment-test">Test ₹1 Live →</Link>}</p><p>Database and private media storage are connected. Open Settings for detailed integration checks.</p></section></div><section className="live-panel"><h2>Recent admin activity</h2>{d.activity.length ? d.activity.map((a: any, i: number) => <div className="billing-row" key={i}><span>{a.action.replaceAll("-", " ")}</span><small>{date(a.created_at)}</small></div>) : <p>Your content and membership changes will appear here.</p>}</section></>}
    {main === "profile" && <AdminCreatorProfile data={d} edit={setEditor} busy={busy} onOpenEditor={openStudioEditor} archive={p => act("post", postPayload({ ...p, status: "archived" }))} remove={p => setConfirm({ title: "Delete this post?", copy: `“${p.title}” and its comments, likes and bookmarks will be permanently removed. Media remains in the library.`, path: "delete-post", data: { id: p.id } })} removeComment={id => setConfirm({ title: "Remove this comment?", copy: "The comment will no longer appear to members.", path: "delete-comment", data: { id } })} />}
    {main === "editor" && (
      <>
        <Title title="Studio Media Suite." copy="Crop, color-grade, watermark, filter, and render professional posts, carousels, and video reels.">
          <Button type="button" className="button" onClick={() => openStudioEditor()}>
            <Sparkles size={16} /> NEW STUDIO PROJECT
          </Button>
        </Title>
        <div style={{ marginBottom: 24 }}>
          <MediaStudioTriggerBanner
            label="Launch Studio Editor"
            subtitle="Drop or pick photos/videos to edit with tone controls, 18 luxury filters, text layers, watermarks, and video reel trimming."
            onOpen={files => openStudioEditor(files)}
          />
        </div>
        <section className="live-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <span className="section-kicker">SAVED DRAFTS &amp; RENDERED PROJECTS</span>
              <h2 style={{ margin: "4px 0 0" }}>Your Studio Projects</h2>
            </div>
            <span style={{ fontSize: 13, color: "var(--ag-muted)" }}>{d.projects?.length ?? 0} project(s)</span>
          </div>
          {d.projects?.length ? (
            <div className="live-grid three">
              {d.projects.map((proj: any) => (
                <article className="live-panel live-media-card" key={proj.id}>
                  {proj.items?.[0]?.output_url || proj.items?.[0]?.source_url ? (
                    <ProtectedImage src={proj.items[0].output_url || proj.items[0].source_url} alt={proj.title} />
                  ) : (
                    <div style={{ height: 160, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                      <Sparkles size={32} style={{ opacity: 0.4 }} />
                    </div>
                  )}
                  <h3>{proj.title}</h3>
                  <small>{String(proj.project_type).toUpperCase()} · {proj.aspect_ratio} · {proj.items?.length ?? 1} item(s)</small>
                  <div className="live-toolbar" style={{ marginTop: 12 }}>
                    <Button variant="outline" onClick={() => openStudioEditor([], proj.id)}>
                      <Pencil size={14} style={{ marginRight: 6 }} /> Open in Editor
                    </Button>
                    <Link className="button quiet-button" href="/admin/posts/new">
                      Create Post →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="live-empty">
              <Sparkles size={34} style={{ opacity: 0.5, marginBottom: 10, color: "#ff85ad" }} />
              <h2>No studio projects created yet.</h2>
              <p>Click "New Studio Project" or drag and drop photos above to open the full photo &amp; reel studio.</p>
              <Button type="button" className="button" style={{ marginTop: 14 }} onClick={() => openStudioEditor()}>
                <Plus size={16} /> Create Studio Project
              </Button>
            </div>
          )}
        </section>
      </>
    )}
    {main === "posts" && <PostList posts={d.posts} edit={setEditor} act={act} busy={busy} remove={p => setConfirm({ title: "Delete this post?", copy: `“${p.title}” and its comments, likes and bookmarks will be permanently removed. Media remains in the library.`, path: "delete-post", data: { id: p.id } })} />}
    {main === "stories" && <StoryManager data={d} act={act} busy={busy} onLaunchEditor={openStudioEditor} remove={story => setConfirm({ title: "Delete this story?", copy: `“${story.title}” will be permanently removed. Its media remains in the library.`, path: "delete-post", data: { id: story.id } })} />}
    {main === "media" && (
      <MediaLibrary
        media={d.media}
        refresh={result.refresh}
        onLaunchEditor={openStudioEditor}
        remove={(id: string) => {
          const asset = d.media.find((item: Asset) => item.id === id);
          setConfirm({
            title: "Delete this media?",
            copy: asset
              ? `Are you sure you want to permanently delete "${asset.name}"? This file will be removed from private storage and your library.`
              : "Unused media will be permanently removed from storage.",
            path: "delete-media",
            data: { id },
          });
        }}
      />
    )}
    {main === "members" && <MemberList members={d.members} plans={plans.data?.plans ?? []} open={setMember} />}
    {main === "plans" && <><Title title="Memberships." copy="Names, prices, benefits and access levels are controlled here. Existing provider subscriptions retain their contracted price." /><div className="live-grid">{d.plans.map((p: Plan) => <PlanEditor key={`${p.id}-${p.updated_at}`} plan={p} act={act} busy={busy} />)}</div></>}
    {main === "payments" && <><Title title="Payments." copy="Verified provider payments only. Complimentary access never creates a payment record." /><Payments payments={d.payments} billing={d.billing} onRefresh={() => void result.refresh()} /></>}
    {main === "settings" && <SettingsEditor data={d} act={act} busy={busy} />}
    {main === "comments" && <><Title title="Community comments." copy="Review comments and remove inappropriate replies. Comment privileges are configured per post." /><section className="live-panel">{d.comments.length ? d.comments.map((c: any) => <div className="live-comment" key={c.id}><strong>{c.display_name}</strong><small>{date(c.created_at)} · {c.title}</small><p>{c.body}</p><Button variant="outline" onClick={() => setConfirm({ title: "Remove this comment?", copy: "The comment will no longer appear to members.", path: "delete-comment", data: { id: c.id } })}>Remove comment</Button></div>) : <p>No comments to review.</p>}</section></>}
    {main === "feedback" && <FeedbackInbox items={d.feedback} act={act} busy={busy} />}
  </>}</section></section></div>
    <Dialog open={Boolean(editor)} onOpenChange={open => { if (!open && !busy) setEditor(null); }}><DialogContent className="live-dialog"><DialogHeader><DialogTitle>Edit post</DialogTitle><DialogDescription>Changes are saved to the database and reflected in eligible members’ feeds.</DialogDescription></DialogHeader>{editor && <PostEditor key={editor.id} post={editor} plans={plans.data?.plans ?? []} act={act} busy={busy} close={() => setEditor(null)} onLaunchEditor={openStudioEditor} />}{message && <Notice>{message}</Notice>}</DialogContent></Dialog>
    <Dialog open={Boolean(member)} onOpenChange={open => { if (!open && !busy) setMember(null); }}><DialogContent className="live-dialog"><DialogHeader><DialogTitle>{member?.display_name}</DialogTitle><DialogDescription>Manage this member’s access. Every manual change is recorded.</DialogDescription></DialogHeader>{member && <MemberEditor member={member} plans={plans.data?.plans ?? []} act={act} busy={busy} close={() => setMember(null)} />}{message && <Notice>{message}</Notice>}</DialogContent></Dialog>
    <NinaStudioEditor
      open={studioEditorOpen}
      onClose={() => {
        setStudioEditorOpen(false);
        setStudioEditorFiles([]);
        setStudioEditorMedia([]);
      }}
      initialFiles={studioEditorFiles}
      initialMedia={studioEditorMedia}
      existingProjectId={existingProjectId}
      onDone={async (editorResult) => {
        setStudioEditorOpen(false);
        setStudioEditorFiles([]);
        setStudioEditorMedia([]);
        if (editorPendingCallback) {
          editorPendingCallback(editorResult.assets as Asset[]);
          setEditorPendingCallback(null);
        }
        await result.refresh();
      }}
    />
    <AlertDialog open={Boolean(confirm)} onOpenChange={open => { if (!open && !busy) setConfirm(null); }}>
      <AlertDialogContent className="live-dialog" size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm?.title || "Confirm Action"}</AlertDialogTitle>
          <AlertDialogDescription>{confirm?.copy}</AlertDialogDescription>
        </AlertDialogHeader>
        {message && (
          <div style={{ marginTop: 12 }}>
            <Notice>{message}</Notice>
            {confirm?.path === "delete-media" && message.includes("attached") && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                style={{ marginTop: 10, width: "100%" }}
                disabled={busy}
                onClick={async () => {
                  if (!confirm) return;
                  const ok = await act("delete-media", { ...(confirm.data as object), force: true });
                  if (ok) {
                    setConfirm(null);
                    await result.refresh();
                  }
                }}
              >
                Force Delete Anyway (Detach from post)
              </Button>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy} onClick={() => setConfirm(null)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={busy}
            onClick={async (e) => {
              e.preventDefault();
              if (confirm) {
                const ok = await act(confirm.path, confirm.data);
                if (ok) {
                  setConfirm(null);
                  await result.refresh();
                }
              }
            }}
          >
            {busy ? "Deleting…" : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
      <DialogContent className="live-dialog" style={{ maxWidth: 880, maxHeight: "90vh", overflowY: "auto", padding: 20 }}>
        <DialogHeader>
          <DialogTitle>Generate Custom Payment &amp; QR Code</DialogTitle>
          <DialogDescription>
            Enter any amount in rupees to generate an instant QR code, downloadable luxury payment card, or direct payment link to share.
          </DialogDescription>
        </DialogHeader>
        <PaymentQrGenerator
          payeeName="Nina Kurain"
          razorpayReady={Boolean(d?.billing?.ready)}
          onPaymentCreated={() => void result.refresh()}
        />
      </DialogContent>
    </Dialog>
  </main>;
}
function PostList({ posts, edit, act, busy, remove }: { posts: ContentPost[]; edit: (p: ContentPost) => void; act: Act; busy: boolean; remove: (p: ContentPost) => void }) {
  const [q, setQ] = useState(""), [status, setStatus] = useState("all");
  const filtered = posts.filter(p => `${p.title} ${p.caption}`.toLowerCase().includes(q.toLowerCase()) && (status === "all" || p.status === status));
  return <>
    <Title title="Your content library." copy="Drafts, scheduled drops and published moments—all in one place.">
      <Link href="/admin/posts/new" className="button"><Plus size={16} />NEW POST</Link>
    </Title>
    <div className="live-toolbar">
      <Input placeholder="Search posts" aria-label="Search posts" value={q} onChange={e => setQ(e.target.value)} />
      <select aria-label="Filter status" value={status} onChange={e => setStatus(e.target.value)}>
        {["all", "published", "draft", "scheduled", "archived"].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </div>
    <section className="live-panel live-table">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Access</th>
            <th>Status</th>
            <th>Publish date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id}>
              <td>
                <button
                  type="button"
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: "inherit" }}
                  onClick={() => edit(p)}
                  title="Click to edit post details and media"
                >
                  <strong style={{ color: "#ffffff", textDecoration: "underline", textUnderlineOffset: 3 }}>{p.title}</strong>
                </button>
                <small>{p.media?.length ?? 0} media file(s)</small>
              </td>
              <td>{p.is_reel ? "Reel" : "Post"}</td>
              <td>{p.access_mode === "free" ? "Free Demo" : p.access_mode === "level" ? `Level ${p.minimum_level}+` : "Specific plans"}</td>
              <td>{p.status === "scheduled" && p.published_at <= Date.now() ? "published" : p.status}</td>
              <td>{p.status === "draft" ? "—" : date(p.published_at)}</td>
              <td>
                <div className="live-toolbar" style={{ gap: 8, margin: 0 }}>
                  <Button variant="outline" size="sm" aria-label={`Edit ${p.title}`} onClick={() => edit(p)} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" disabled={busy || p.status === "archived"} onClick={() => void act("post", postPayload({ ...p, status: "archived" }))}>
                    Archive
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${p.title}`} onClick={() => remove(p)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!filtered.length && <p>No posts match this filter.</p>}
    </section>
  </>;
}
function postPayload(p: ContentPost) { return { ...p, expectedUpdatedAt: p.updated_at, media_ids: p.media?.map(m => m.asset_id) ?? [], cover_id: p.media?.find(m => m.cover)?.asset_id ?? p.media?.[0]?.asset_id ?? "", plan_ids: p.plan_ids ?? [] }; }
type Asset = { id: string; name: string; mime: string; url: string; bytes?: number };
function upload(file: File, progress: (n: number) => void): Promise<Asset> { return new Promise((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open("POST", "/api/studio/upload"); xhr.upload.onprogress = e => { if (e.lengthComputable) progress(Math.round(e.loaded / e.total * 100)); }; xhr.onerror = () => reject(new Error("Upload connection failed. Please retry.")); xhr.onload = () => { try { const result = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300) resolve(result); else reject(new Error(result.message ?? "Upload failed.")); } catch { reject(new Error("Upload failed. Please retry.")); } }; const form = new FormData(); form.set("file", file); xhr.send(form); }); }
function UploadControl({ done, onLaunchEditor }: { done: (assets: Asset[]) => void; onLaunchEditor?: (files?: File[]) => void }) {
  const [busy, setBusy] = useState(false), [progress, setProgress] = useState(0), [message, setMessage] = useState("");
  const handleDirectUpload = async (files: File[], input: HTMLInputElement) => {
    if (files.some(f => f.size > 25 * 1024 * 1024)) { setMessage("Each file must be 25 MB or smaller."); return; }
    setBusy(true); setMessage(""); const saved: Asset[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setMessage(`Uploading ${i + 1} of ${files.length}…`);
        saved.push(await upload(files[i], setProgress));
      }
      setMessage(`${saved.length} file(s) saved to private storage.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      done(saved); setBusy(false); input.value = "";
    }
  };
  return (
    <div className="live-upload">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <label style={{ margin: 0, cursor: busy ? "not-allowed" : "pointer" }}>
          <Upload size={17} /> Direct Upload
          <input
            aria-label="Upload media"
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4"
            multiple
            disabled={busy}
            onChange={e => {
              const input = e.target, files = Array.from(input.files ?? []);
              if (files.length) void handleDirectUpload(files, input);
            }}
          />
        </label>
        {onLaunchEditor && (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onLaunchEditor()}
            style={{
              borderColor: "rgba(229,107,131,0.4)",
              color: "#ff85ad",
              background: "rgba(229,107,131,0.08)",
              fontWeight: 600,
              fontSize: 13,
              minHeight: 40,
              padding: "0 14px",
            }}
          >
            <Sparkles size={14} style={{ marginRight: 6 }} /> Open in Studio Editor (Optional)
          </Button>
        )}
      </div>
      <small>JPEG, PNG, WebP or MP4 · 25 MB per file · Launch Studio Editor anytime for color grading, crops, and watermark</small>
      {busy && <progress value={progress} max={100} aria-label="Upload progress" />}
      {message && <Notice>{message}</Notice>}
    </div>
  );
}
function StoryManager({ data, act, busy, remove, onLaunchEditor }: { data: { stories: ContentPost[]; plans: Plan[] }; act: Act; busy: boolean; remove: (story: ContentPost) => void; onLaunchEditor?: (files?: File[]) => void }) {
  const media = useData<{ media: Asset[] }>("/api/studio/media", 60000), [selected, setSelected] = useState(""), [access, setAccess] = useState<"free" | "level" | "specific">("free"), [level, setLevel] = useState(1), [planIds, setPlanIds] = useState<string[]>([]), [highlight, setHighlight] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget, values = Object.fromEntries(new FormData(form)); if (await act("story", { title: values.title, caption: values.caption ?? "", access_mode: access, minimum_level: level, plan_ids: planIds, media_id: selected, highlight })) { form.reset(); setSelected(""); setAccess("free"); setLevel(1); setPlanIds([]); setHighlight(false); } }
  const now = Date.now();
  return <><Title title="Stories & highlights." copy="Share a 24-hour moment or keep it permanently as a highlight. Every story follows the same membership permissions as your main collection." /><section className="live-panel story-editor-panel"><form onSubmit={submit}><fieldset className="live-form" disabled={busy}><div className="live-grid"><label>Story title<Input name="title" required maxLength={80} placeholder="A private moment" /></label><label>Collection and access<select value={access} onChange={event => setAccess(event.target.value as typeof access)}><option value="free">Demo · visible to every member</option><option value="level">Exclusive · minimum membership</option><option value="specific">Exclusive · selected plans</option></select></label></div><label>Caption<textarea name="caption" maxLength={1000} placeholder="Say something about this moment…" /></label>{access === "level" && <label>Minimum membership<select value={level} onChange={event => setLevel(Number(event.target.value))}>{data.plans.filter(plan => plan.level > 0).map(plan => <option value={plan.level} key={plan.id}>{plan.name} · {money(plan.price)}</option>)}</select></label>}{access === "specific" && <div className="story-plan-picker">{data.plans.filter(plan => plan.level > 0).map(plan => <label className="live-check" key={plan.id}><Checkbox checked={planIds.includes(plan.id)} onCheckedChange={checked => setPlanIds(current => checked ? [...current, plan.id] : current.filter(id => id !== plan.id))} />{plan.name}</label>)}</div>}<UploadControl onLaunchEditor={onLaunchEditor} done={assets => { if (assets[0]) setSelected(assets[0].id); void media.refresh(); }} /><div><h3>Choose one photo or video</h3>{media.error && <Notice>{media.error}</Notice>}<div className="live-media-picker story-media-picker">{media.data?.media.map(asset => <label className={selected === asset.id ? "selected" : ""} key={asset.id}><input type="radio" name="story_media" value={asset.id} checked={selected === asset.id} onChange={() => setSelected(asset.id)} />{asset.name}{asset.mime.startsWith("video") ? <ProtectedVideo src={asset.url} muted preload="metadata" /> : <ProtectedImage src={asset.url} alt={asset.name} />}</label>)}</div></div><label className="live-check story-highlight-toggle"><Switch checked={highlight} onCheckedChange={setHighlight} /><span><strong>Save directly to highlights</strong><small>{highlight ? "This story remains visible until you remove it." : "This story disappears automatically 24 hours after publishing."}</small></span></label><Button type="submit" disabled={busy || !selected || (access === "specific" && !planIds.length)}>{busy ? "Publishing…" : highlight ? "Publish highlight" : "Publish 24-hour story"}</Button></fieldset></form></section><section className="story-admin-list"><div className="story-admin-heading"><div><span className="section-kicker">PUBLISHED STORIES</span><h2>Live, highlighted and expired</h2></div><span>{data.stories.length} total</span></div>{data.stories.length ? <div className="live-grid three">{data.stories.map(story => { const asset = story.media?.[0], expired = !story.is_highlight && Boolean(story.story_expires_at && story.story_expires_at <= now); return <article className={`live-panel story-admin-card ${expired ? "expired" : ""}`} key={story.id}><div className="story-admin-preview">{asset?.mime.startsWith("video") ? <ProtectedVideo src={asset.url} muted preload="metadata" /> : <ProtectedImage src={asset?.url} alt={story.title} />}<span className={`story-status ${story.is_highlight ? "highlight" : expired ? "expired" : "live"}`}>{story.is_highlight ? "HIGHLIGHT" : expired ? "EXPIRED" : "LIVE"}</span></div><h3>{story.title}</h3><p>{story.caption || "No caption"}</p><small>{story.access_mode === "free" ? "Demo access" : story.access_mode === "level" ? `Level ${story.minimum_level}+` : "Selected plans"}</small><small><Clock3 size={13} />{story.is_highlight ? "Permanent highlight" : expired ? `Expired ${date(story.story_expires_at ?? null)}` : `Expires ${date(story.story_expires_at ?? null)}`}</small><div className="live-toolbar"><Button type="button" variant="outline" disabled={busy} onClick={() => void act("story-highlight", { id: story.id, selected: !story.is_highlight })}>{story.is_highlight ? "Remove highlight" : "Add to highlights"}</Button><Button type="button" variant="ghost" aria-label={`Delete ${story.title}`} disabled={busy} onClick={() => remove(story)}><Trash2 size={16} /></Button></div></article>; })}</div> : <div className="live-empty"><CirclePlay size={30} /><h2>No stories yet.</h2><p>Choose a private photo or film above to publish your first story.</p></div>}</section></>;
}
function PostEditor({
  post,
  plans,
  act,
  busy,
  close,
  onLaunchEditor,
}: {
  post?: ContentPost;
  plans: Plan[];
  act: Act;
  busy: boolean;
  close: () => void;
  onLaunchEditor?: (
    files?: File[],
    projId?: string,
    onAssetsDone?: (assets: Asset[]) => void,
    mediaItems?: Array<{ id?: string; name: string; mime: string; url: string; editRecipe?: string }>
  ) => void;
}) {
  const media = useData<{ media: Asset[] }>("/api/studio/media", 60000);
  const [selected, setSelected] = useState<string[]>(
    post?.media?.map((m) => m.asset_id) ?? []
  );
  const [cover, setCover] = useState<string>(
    post?.media?.find((m) => m.cover)?.asset_id ??
      post?.media?.[0]?.asset_id ??
      ""
  );
  const [access, setAccess] = useState<"free" | "level" | "specific">(
    (post?.access_mode as "free" | "level" | "specific") ?? "free"
  );
  const [planIds, setPlanIds] = useState<string[]>(post?.plan_ids ?? []);
  const [status, setStatus] = useState<"draft" | "published" | "scheduled" | "archived">(
    (post?.status as "draft" | "published" | "scheduled" | "archived") ?? "draft"
  );
  const [showLibraryPicker, setShowLibraryPicker] = useState<boolean>(false);

  const toLocal = (n: number) =>
    new Date(n - new Date(n).getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const payload = {
      ...f,
      id: post?.id,
      expectedUpdatedAt: post?.updated_at,
      minimum_level: Number(f.minimum_level ?? 0),
      comment_level: Number(f.comment_level),
      access_mode: access,
      status,
      plan_ids: planIds,
      media_ids: selected,
      cover_id: cover || selected[0] || "",
      published_at:
        status === "scheduled"
          ? new Date(String(f.published_at)).getTime()
          : status === "published"
          ? post?.status === "published"
            ? post.published_at
            : Date.now()
          : post?.published_at ?? Date.now(),
    };
    if (await act("post", payload)) close();
  }

  // Get full asset details for each selected media item
  const attachedAssets = selected
    .map((assetId) => {
      const fromLib = media.data?.media.find((m) => m.id === assetId);
      if (fromLib) return fromLib;
      const fromPost = post?.media?.find((m) => m.asset_id === assetId);
      if (fromPost) {
        return {
          id: fromPost.asset_id,
          name: fromPost.name || `Media ${fromPost.display_order + 1}`,
          mime: fromPost.mime,
          url: fromPost.url,
        };
      }
      return null;
    })
    .filter(Boolean) as Asset[];

  const handleEditMediaInStudio = (asset: Asset) => {
    onLaunchEditor?.(
      undefined,
      undefined,
      (newAssets) => {
        if (newAssets.length) {
          const replacement = newAssets[0];
          setSelected((curr) =>
            curr.map((id) => (id === asset.id ? replacement.id : id))
          );
          if (cover === asset.id) {
            setCover(replacement.id);
          }
          void media.refresh();
        }
      },
      [{ id: asset.id, name: asset.name, mime: asset.mime, url: asset.url }]
    );
  };

  const handleMoveMedia = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= selected.length) return;
    const newSelected = [...selected];
    const temp = newSelected[idx];
    newSelected[idx] = newSelected[targetIdx];
    newSelected[targetIdx] = temp;
    setSelected(newSelected);
  };

  const handleRemoveMedia = (assetId: string) => {
    const next = selected.filter((id) => id !== assetId);
    setSelected(next);
    if (cover === assetId) {
      setCover(next[0] || "");
    }
  };

  return (
    <form onSubmit={submit}>
      <fieldset className="live-form" disabled={busy}>
        {post && (
          <div className="post-edit-badge-bar">
            <span className="badge-edit-mode">
              Editing Post · {post.title}
            </span>
            <span className={`post-status-pill status-${post.status}`}>
              {post.status.toUpperCase()}
            </span>
          </div>
        )}

        <label>
          Title
          <Input
            name="title"
            defaultValue={post?.title ?? ""}
            required
            maxLength={160}
            placeholder="Post title…"
          />
        </label>

        <label>
          Caption
          <textarea
            name="caption"
            defaultValue={post?.caption ?? ""}
            maxLength={5000}
            placeholder="Write a caption or story for this post…"
          />
        </label>

        {/* Attached Media Manager */}
        <div className="post-attached-media-section">
          <div className="section-title-row">
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                Attached Media ({attachedAssets.length})
              </h3>
              <small style={{ color: "#a58b99", fontSize: 12 }}>
                Click <strong>Edit in Studio</strong> to crop, zoom, or color-grade any photo or video clip.
              </small>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLibraryPicker(!showLibraryPicker)}
            >
              {showLibraryPicker ? "Hide Library" : "+ Choose from Library"}
            </Button>
          </div>

          {attachedAssets.length > 0 ? (
            <div className="attached-media-grid">
              {attachedAssets.map((asset, idx) => {
                const isCover = cover === asset.id || (!cover && idx === 0);
                return (
                  <div
                    className={`attached-media-card ${isCover ? "is-cover" : ""}`}
                    key={asset.id}
                  >
                    <div className="attached-media-thumb">
                      {asset.mime.startsWith("video/") ? (
                        <ProtectedVideo src={asset.url} muted preload="metadata" />
                      ) : (
                        <ProtectedImage src={asset.url} alt={asset.name} />
                      )}
                      <span className="slide-num-badge">#{idx + 1}</span>
                      {isCover && <span className="cover-badge">★ COVER</span>}
                    </div>

                    <div className="attached-media-info">
                      <strong title={asset.name}>{asset.name}</strong>
                      <small>{asset.mime.startsWith("video/") ? "Video Reel" : "Photo"}</small>
                    </div>

                    <div className="attached-media-actions">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="btn-studio-edit"
                        title="Open this photo/video in Studio Editor to crop, zoom, and adjust"
                        onClick={() => handleEditMediaInStudio(asset)}
                      >
                        <Sparkles size={13} />
                        <span>Edit in Studio</span>
                      </Button>

                      <div className="btn-group-row">
                        {!isCover && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="btn-make-cover"
                            onClick={() => setCover(asset.id)}
                            title="Set as cover image"
                          >
                            Set Cover
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() => handleMoveMedia(idx, -1)}
                          title="Move earlier"
                        >
                          ←
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === attachedAssets.length - 1}
                          onClick={() => handleMoveMedia(idx, 1)}
                          title="Move later"
                        >
                          →
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="btn-remove"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveMedia(asset.id);
                          }}
                          title="Remove from post"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="attached-media-empty">
              No media attached yet. Upload or choose from your library below.
            </div>
          )}
        </div>

        {/* Upload Control */}
        <UploadControl
          onLaunchEditor={
            onLaunchEditor
              ? (files) =>
                  onLaunchEditor(files, undefined, (newAssets) => {
                    if (newAssets.length) {
                      setSelected((old) => [...old, ...newAssets.map((a) => a.id)]);
                      if (!cover) setCover(newAssets[0].id);
                      void media.refresh();
                    }
                  })
              : undefined
          }
          done={(assets) => {
            if (assets.length) {
              setSelected((old) => [...old, ...assets.map((a) => a.id)]);
              if (!cover) setCover(assets[0].id);
              void media.refresh();
            }
          }}
        />

        {/* Media Library Picker (Drawer) */}
        {showLibraryPicker && (
          <div className="library-picker-drawer">
            <h3 style={{ margin: "0 0 10px 0", fontSize: 14 }}>
              Select Media from Library
            </h3>
            {media.error && <Notice>{media.error}</Notice>}
            <div className="live-media-picker">
              {media.data?.media.map((m) => (
                <label key={m.id} className={selected.includes(m.id) ? "selected" : ""}>
                  <input
                    type="checkbox"
                    checked={selected.includes(m.id)}
                    onChange={(e) => {
                      setSelected((v) =>
                        e.target.checked ? [...v, m.id] : v.filter((id) => id !== m.id)
                      );
                      if (e.target.checked && !cover) setCover(m.id);
                    }}
                  />
                  <span>{m.name}</span>
                  {m.mime.startsWith("video") ? (
                    <ProtectedVideo src={m.url} muted preload="metadata" />
                  ) : (
                    <ProtectedImage src={m.url} alt={m.name} />
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        <label>
          Cover image / first media
          <select value={cover} onChange={(e) => setCover(e.target.value)} required>
            <option value="">Choose cover</option>
            {attachedAssets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {cover === m.id ? "(Current Cover)" : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="live-grid">
          <label>
            Collection and access
            <select value={access} onChange={(e) => setAccess(e.target.value as typeof access)}>
              <option value="free">Demo · selected preview for all members</option>
              <option value="level">Exclusive · minimum membership</option>
              <option value="specific">Exclusive · selected plans</option>
            </select>
          </label>
          {access === "level" && (
            <label>
              Minimum membership
              <select name="minimum_level" defaultValue={post?.minimum_level ?? 1}>
                {plans
                  .filter((p) => p.level > 0)
                  .map((p) => (
                    <option key={p.id} value={p.level}>
                      {p.name} · {money(p.price)}+
                    </option>
                  ))}
              </select>
            </label>
          )}
        </div>

        {access === "specific" && (
          <div>
            <label style={{ marginBottom: 6 }}>Eligible Plans</label>
            {plans
              .filter((p) => p.level > 0)
              .map((p) => (
                <label className="live-check" key={p.id}>
                  <Checkbox
                    checked={planIds.includes(p.id)}
                    onCheckedChange={(v) =>
                      setPlanIds((current) =>
                        v ? [...current, p.id] : current.filter((x) => x !== p.id)
                      )
                    }
                  />
                  {p.name} · {money(p.price)}
                </label>
              ))}
          </div>
        )}

        <label>
          Comment permissions
          <select name="comment_level" defaultValue={post?.comment_level ?? -1}>
            <option value={-1}>Comments disabled</option>
            <option value={0}>All eligible members</option>
            {plans
              .filter((p) => p.level > 0)
              .map((p) => (
                <option key={p.id} value={p.level}>
                  {p.name} and above
                </option>
              ))}
          </select>
        </label>

        <label>
          Publish state
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="draft">Save as draft</option>
            <option value="published">Publish now</option>
            <option value="scheduled">Schedule</option>
            <option value="archived">Archive</option>
          </select>
        </label>

        {status === "scheduled" && (
          <label>
            Publish date and time (your local time)
            <Input
              type="datetime-local"
              name="published_at"
              required
              defaultValue={toLocal(
                post?.published_at && post.published_at > Date.now()
                  ? post.published_at
                  : Date.now() + 3600000
              )}
            />
          </label>
        )}

        <div className="live-toolbar" style={{ marginTop: 24 }}>
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !selected.length}>
            {busy
              ? "Saving…"
              : post
              ? "Save Changes"
              : status === "draft"
              ? "Save draft"
              : status === "scheduled"
              ? "Schedule post"
              : status === "archived"
              ? "Archive post"
              : "Publish post"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

function MediaLibrary({
  media,
  refresh,
  remove,
  onLaunchEditor,
}: {
  media: Asset[];
  refresh: () => Promise<void>;
  remove: (id: string) => void;
  onLaunchEditor?: (
    files?: File[],
    projId?: string,
    onAssetsDone?: (assets: Asset[]) => void,
    mediaItems?: Array<{ id?: string; name: string; mime: string; url: string; editRecipe?: string }>
  ) => void;
}) {
  const [q, setQ] = useState(""),
        [type, setType] = useState("all"),
        [preview, setPreview] = useState<Asset | null>(null);

  const list = media.filter(
    (m) =>
      m.name.toLowerCase().includes(q.toLowerCase()) &&
      (type === "all" || m.mime.startsWith(type))
  );

  return (
    <>
      <Title
        title="Your media library."
        copy="Original files are stored privately. Members receive short-lived, account-bound media links."
      />
      <UploadControl
        onLaunchEditor={(files) => onLaunchEditor?.(files)}
        done={() => void refresh()}
      />
      <div className="live-toolbar">
        <Input
          placeholder="Search media"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search media"
        />
        <select
          aria-label="Media type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All media</option>
          <option value="image">Images</option>
          <option value="video">Films</option>
        </select>
      </div>

      <div className="live-grid three">
        {list.map((m) => (
          <article className="live-panel live-media-card" key={m.id}>
            {m.mime.startsWith("video") ? (
              <ProtectedVideo src={m.url} preload="metadata" controls playsInline />
            ) : (
              <ProtectedImage src={m.url} alt={m.name} />
            )}
            <h3>{m.name}</h3>
            <small>
              {m.mime} · {((m.bytes ?? 0) / 1024 / 1024).toFixed(2)} MB
            </small>
            <div className="live-toolbar" style={{ gap: 8, marginTop: 12 }}>
              <Button variant="outline" size="sm" onClick={() => setPreview(m)}>
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                style={{
                  color: "#ff85ad",
                  borderColor: "rgba(229, 107, 131, 0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
                title="Edit this media in Nina Studio Editor (crop, zoom, filters, adjustments)"
                onClick={() => {
                  onLaunchEditor?.(
                    undefined,
                    undefined,
                    async () => {
                      await refresh();
                    },
                    [{ id: m.id, name: m.name, mime: m.mime, url: m.url }]
                  );
                }}
              >
                <Sparkles size={14} /> Edit in Studio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="media-card-delete-btn"
                aria-label={`Delete ${m.name}`}
                title="Delete this media"
                style={{ color: "#f87171" }}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(m.id);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!list.length && (
        <div className="live-empty">No matching media. Upload a file to begin.</div>
      )}
      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="live-dialog">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
            <DialogDescription>Private media preview</DialogDescription>
          </DialogHeader>
          <div className="protected-media-frame">
            {preview?.mime.startsWith("video") ? (
              <ProtectedVideo src={preview.url} controls playsInline />
            ) : (
              <ProtectedImage src={preview?.url} alt={preview?.name ?? ""} />
            )}
            <PrivateMediaMark />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
function MemberList({ members, plans, open }: { members: any[]; plans: Plan[]; open: (m: any) => void }) { const [q, setQ] = useState(""), [plan, setPlan] = useState("all"), [status, setStatus] = useState("all"); const effective = (m: any) => ((m.status === "grace_period" && m.grace_ends_at > Date.now()) || (["active", "cancelled", "cancel_at_period_end"].includes(m.status) && m.current_period_end > Date.now())) ? m.plan_id : "free"; const list = members.filter(m => `${m.display_name} ${m.email}`.toLowerCase().includes(q.toLowerCase()) && (plan === "all" || effective(m) === plan) && (status === "all" || (m.status ?? "free") === status)); return <><Title title="Your members." copy="Real registered accounts and their current access." /><div className="live-toolbar"><Input aria-label="Search members" placeholder="Search name or email" value={q} onChange={e => setQ(e.target.value)} /><select aria-label="Membership filter" value={plan} onChange={e => setPlan(e.target.value)}><option value="all">All memberships</option>{plans.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select><select aria-label="Member status filter" value={status} onChange={e => setStatus(e.target.value)}>{["all", "free", "active", "grace_period", "expired", "cancelled"].map(v => <option key={v} value={v}>{v.replaceAll("_", " ")}</option>)}</select></div><section className="live-panel live-table"><table><thead><tr><th>Member</th><th>Effective plan</th><th>Status</th><th>Created</th><th>Period end</th><th>Actions</th></tr></thead><tbody>{list.map(m => <tr key={m.id}><td><strong>{m.display_name}</strong><small>{m.email}</small>{!m.active && <small>Account deleted</small>}</td><td>{plans.find(p => p.id === effective(m))?.name ?? "Free"}</td><td>{m.status ?? "free"}{m.provider === "complimentary" && <small>Complimentary</small>}</td><td>{date(m.created_at)}</td><td>{date(m.current_period_end)}</td><td><Button variant="outline" onClick={() => open(m)}>View member</Button></td></tr>)}</tbody></table>{!list.length && <p>No members found.</p>}</section></>; }
function MemberEditor({ member, plans, act, busy, close }: { member: any; plans: Plan[]; act: Act; busy: boolean; close: () => void }) { const detail = useData(`/api/studio/member/${member.id}`); const [blocked, setBlocked] = useState(Boolean(member.comments_blocked)); return <div><p>{member.email} · Joined {date(member.created_at)}</p><form onSubmit={async ev => { ev.preventDefault(); const f = Object.fromEntries(new FormData(ev.currentTarget)); if (await act("member", { ...f, id: member.id, days: Number(f.days), comments_blocked: blocked })) close(); }}><fieldset className="live-form" disabled={busy || !member.active}><label>Action<select name="action"><option value="grant">Grant / change complimentary membership</option><option value="extend">Extend membership</option><option value="revoke">Revoke paid access</option></select></label><label>Membership<select name="plan_id" defaultValue={member.plan_id ?? "free"}>{plans.map(p => <option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}</select></label><label>Duration / extension (days)<Input name="days" type="number" min={1} max={3650} defaultValue={30} required /></label><label className="live-check"><Switch checked={blocked} onCheckedChange={setBlocked} />Block commenting</label><label>Reason (stored in audit log)<textarea name="reason" minLength={3} maxLength={500} required /></label><Button type="submit">Save access change</Button></fieldset></form><h3>Payment history</h3>{detail.error ? <Notice>{detail.error}</Notice> : detail.data?.payments.length ? detail.data.payments.map((p: any) => <p key={p.id}>{date(p.created_at)} · {money(p.amount / 100)} · {p.status}</p>) : <p>No payments recorded.</p>}<h3>Admin activity</h3>{detail.data?.activity.map((a: any, i: number) => <p key={i}>{date(a.created_at)} · {a.action}</p>)}</div>; }
function PlanEditor({ plan: p, act, busy }: { plan: Plan; act: Act; busy: boolean }) {
  const [active, setActive] = useState(Boolean(p.active));
  const [discountEnabled, setDiscountEnabled] = useState(Boolean(p.discount_enabled));
  const [discountAmount, setDiscountAmount] = useState(p.discount_amount ?? 0);
  const [price, setPrice] = useState(p.price);
  useEffect(() => {
    setActive(Boolean(p.active));
    setDiscountEnabled(Boolean(p.discount_enabled));
    setDiscountAmount(p.discount_amount ?? 0);
    setPrice(p.price);
  }, [p.updated_at, p.active, p.discount_enabled, p.discount_amount, p.price]);
  const isFree = p.id === "free";
  const previewPlan = { ...p, price, discount_enabled: discountEnabled ? 1 : 0, discount_amount: discountAmount };
  const pricing = getPlanPricing(previewPlan);
  return <section className="live-panel"><h2>{p.name}</h2><form className="live-form" onSubmit={async ev => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(ev.currentTarget));
    const parsedEndsAt = f.discount_ends_at ? new Date(String(f.discount_ends_at)).getTime() : null;
    await act("plan", {
      ...f,
      id: p.id,
      name: String(f.name || p.name).trim(),
      price: Number(f.price),
      level: Number(f.level),
      display_order: Number(f.display_order),
      active,
      description: String(f.description || "").trim(),
      badge: String(f.badge || "").trim(),
      benefits: String(f.benefits || "").split("\n").map(s => s.trim()).filter(Boolean),
      discount_enabled: discountEnabled,
      discount_amount: discountEnabled ? Number(f.discount_amount || 0) : 0,
      discount_label: discountEnabled ? (String(f.discount_label || "").trim() || null) : null,
      discount_badge: discountEnabled ? (String(f.discount_badge || "").trim() || null) : null,
      discount_ends_at: discountEnabled ? ((parsedEndsAt && !isNaN(parsedEndsAt)) ? parsedEndsAt : null) : null
    });
  }}><label>Membership name<Input name="name" defaultValue={p.name} required maxLength={80} /></label><div className="live-grid"><label>Monthly price (INR)<Input name="price" type="number" min={0} max={100000} defaultValue={p.price} required readOnly={isFree} onChange={ev => setPrice(Number(ev.target.value))} /></label><label>Access level<Input name="level" type="number" min={isFree ? 0 : 1} max={3} defaultValue={p.level} required readOnly={isFree} /></label></div><label>Description<textarea name="description" defaultValue={p.description} maxLength={500} /></label><label>Benefits (one per line)<textarea name="benefits" defaultValue={(() => { try { const b = JSON.parse(p.benefits); return Array.isArray(b) ? b.join("\n") : String(b); } catch { return p.benefits || ""; } })()} required /></label><div className="live-grid"><label>Badge<Input name="badge" defaultValue={p.badge} maxLength={40} /></label><label>Display order<Input name="display_order" type="number" min={0} max={20} defaultValue={p.display_order} required /></label></div><label className="live-check"><Switch checked={active} onCheckedChange={setActive} disabled={isFree} />Available to new subscribers</label><fieldset className="plan-discount-fieldset" disabled={isFree}><legend>Discount pricing</legend><label className="live-check"><Switch checked={discountEnabled} onCheckedChange={setDiscountEnabled} disabled={isFree} />Show a discount on this plan</label>{discountEnabled && <><div className="live-grid"><label>Discount amount (INR)<Input name="discount_amount" type="number" min={0} max={100000} defaultValue={p.discount_amount ?? 0} onChange={ev => setDiscountAmount(Number(ev.target.value))} /></label><label>Discount badge<Input name="discount_badge" defaultValue={p.discount_badge ?? ""} maxLength={40} placeholder="e.g. SAVE ₹100" /></label></div><div className="live-grid"><label>Discount label<Input name="discount_label" defaultValue={p.discount_label ?? ""} maxLength={100} placeholder="e.g. MEMBER ACCESS PRICE" /></label><label>Offer ends (optional)<Input name="discount_ends_at" type="datetime-local" defaultValue={p.discount_ends_at ? new Date(p.discount_ends_at).toISOString().slice(0, 16) : ""} /></label></div></>}{!discountEnabled && <><input type="hidden" name="discount_amount" value={0} /><input type="hidden" name="discount_badge" value="" /><input type="hidden" name="discount_label" value="" /><input type="hidden" name="discount_ends_at" value="" /></>}</fieldset>{!isFree && <div className="plan-pricing-preview"><span className="preview-label">LIVE PRICING PREVIEW</span>{pricing.discountActive ? <><div className="preview-row"><span>Original price</span><strong className="price-original">{money(pricing.originalPrice)}</strong></div><div className="preview-row"><span>Member price</span><strong className="price-current">{money(pricing.currentPrice)}/month</strong></div><div className="preview-row"><span>Savings</span><strong className="price-savings">{pricing.savingsText}</strong></div>{pricing.endsAtFormatted && <div className="preview-row"><span>Expiry</span><span>{pricing.endsAtFormatted}</span></div>}</> : <div className="preview-row"><span>Member price</span><strong>{money(price)}/month</strong></div>}</div>}<Button type="submit" disabled={busy}>Save membership</Button></form></section>;
}
function RealPaymentGatewayTest({ billing, busy, onSuccess }: { billing: any; busy: boolean; onSuccess?: () => void }) {
  const [testing, setTesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testPayment, setTestPayment] = useState<{ id: string; orderId: string; shortUrl: string; amountDisplay: string; keyId: string; mode: string } | null>(null);
  const [statusResult, setStatusResult] = useState<{ status: string; amountPaid?: number; id?: string } | null>(null);
  const [error, setError] = useState("");

  async function initiateTest() {
    setTesting(true);
    setError("");
    setStatusResult(null);
    try {
      const res = await api("/api/studio/test-payment", {});
      setTestPayment(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate real test payment.");
    } finally {
      setTesting(false);
    }
  }

  async function checkStatus(id: string) {
    setVerifying(true);
    setError("");
    try {
      const res = await api(`/api/studio/test-payment?id=${encodeURIComponent(id)}`);
      setStatusResult(res);
      if (res.status === "paid" || Number(res.amountPaid) >= 1) {
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status check failed. Please retry.");
    } finally {
      setVerifying(false);
    }
  }

  function copyUrl() {
    if (!testPayment?.shortUrl) return;
    navigator.clipboard.writeText(testPayment.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function launchPopup() {
    if (!testPayment) return;
    const launch = () => {
      const rzp = new (window as any).Razorpay({
        key: testPayment.keyId,
        amount: 100,
        currency: "INR",
        name: "Nina Kurain Creator Studio",
        description: "₹1 Live Gateway Verification Test",
        order_id: testPayment.orderId,
        prefill: {
          name: "Admin Tester",
          email: "insta.ninak12@gmail.com"
        },
        theme: { color: "#a92f49" },
        handler: function (response: any) {
          if (response?.razorpay_payment_id) {
            void checkStatus(response.razorpay_payment_id);
          }
        }
      });
      rzp.open();
    };

    if ((window as any).Razorpay) {
      launch();
    } else {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => launch();
      document.body.appendChild(script);
    }
  }

  const isPaid = statusResult?.status === "paid" || Number(statusResult?.amountPaid) >= 1;

  return <section className="live-panel real-payment-test-card" id="payment-test" style={{ marginTop: 16 }}>
    <div className="settings-card-heading">
      <span className="settings-icon"><IndianRupee size={18} /></span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h2>Real Payment Gateway Test (₹1 Live Amount)</h2>
          <span className="sultry-badge hot" style={{ fontSize: 10, padding: "2px 8px" }}>
            REAL ₹1 SENDING
          </span>
        </div>
        <p>Test your live Razorpay gateway with an actual ₹1 (100 paise) transaction using UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or Netbanking.</p>
      </div>
    </div>

    <div className="drive-status" style={{ background: "rgba(255,45,117,0.06)", border: "1px solid rgba(255,45,117,0.25)" }}>
      <span className={`drive-status-pill ${billing?.ready ? "connected" : "waiting"}`}>
        {billing?.ready ? `${String(billing.mode).toUpperCase()} READY` : "NEEDS SETUP"}
      </span>
      <div>
        <strong>
          {billing?.ready
            ? "Ready to initiate real ₹1 live transactions with Razorpay."
            : "Razorpay live credentials need configuration in environment."}
        </strong>
        <p>Environment: {billing?.keyMode ?? "unknown"} mode ({billing?.keyId ? `${billing.keyId.slice(0, 14)}...` : "No key configured"})</p>
      </div>
    </div>

    {error && <Notice>{error}</Notice>}

    {!testPayment ? (
      <div style={{ marginTop: 18 }}>
        <Button
          type="button"
          disabled={busy || testing || !billing?.ready}
          onClick={initiateTest}
          style={{ background: "#a92f49", color: "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <IndianRupee size={15} />
          {testing ? "Creating ₹1 Live Order & Link…" : "Initiate ₹1 Real Payment Test"}
        </Button>
        <small style={{ display: "block", color: "#888", marginTop: 8, lineHeight: 1.5 }}>
          Generates an authentic ₹1 Razorpay live checkout order and payment link. You can complete the payment via QR code, phone UPI, or card to verify funds credit properly.
        </small>
      </div>
    ) : (
      <div className="test-payment-result" style={{ marginTop: 18, background: "rgba(14,14,14,0.95)", border: "1px solid rgba(255,45,117,0.3)", borderRadius: 8, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>₹1.00</span>
            <span style={{ fontSize: 11, background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4, color: "#bbb" }}>
              Order: <b>{testPayment.orderId}</b>
            </span>
          </div>
          {isPaid ? (
            <span style={{ color: "#4ade80", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13 }}>
              <CheckCircle2 size={16} /> ₹1.00 RECEIVED & VERIFIED (PAID)
            </span>
          ) : (
            <span style={{ color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 12 }}>
              <Clock3 size={15} /> AWAITING PAYMENT (₹1)
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <a
            href={testPayment.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button"
            style={{ background: "#a92f49", color: "#fff", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, fontSize: 14 }}
          >
            <ExternalLink size={15} /> Open Razorpay Link / UPI QR (₹1)
          </a>

          <Button
            type="button"
            variant="outline"
            onClick={launchPopup}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <CreditCard size={15} /> Pay via Razorpay Modal
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={copyUrl}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {copied ? <Check size={15} style={{ color: "#4ade80" }} /> : <Copy size={15} />}
            {copied ? "Link Copied!" : "Copy Payment Link"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={verifying}
            onClick={() => void checkStatus(testPayment.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <CheckCircle2 size={15} />
            {verifying ? "Checking Live Status…" : "Verify ₹1 Received"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={initiateTest}
            disabled={testing}
            style={{ fontSize: 12, color: "#888" }}
          >
            New ₹1 Test
          </Button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "#777", wordBreak: "break-all" }}>
          Hosted Checkout URL: <a href={testPayment.shortUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#e56b83", textDecoration: "underline" }}>{testPayment.shortUrl}</a>
        </div>

        {isPaid && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 6, color: "#4ade80", fontSize: 13 }}>
            🎉 <strong>Live Gateway Test Succeeded!</strong> The ₹1 real test transaction was verified by Razorpay Live. Your payment gateway is configured, online, and accepting real payments.
          </div>
        )}
      </div>
    )}
  </section>;
}

function Payments({ payments, billing, onRefresh }: { payments: any[]; billing?: any; onRefresh?: () => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const list = (payments || []).filter(p => `${p.email} ${p.display_name} ${p.provider_payment_id}`.toLowerCase().includes(q.toLowerCase()) && (status === "all" || p.status === status));
  return (
    <>
      <PaymentQrGenerator payeeName="Nina Kurain" razorpayReady={Boolean(billing?.ready)} onPaymentCreated={onRefresh} />
      {billing && <RealPaymentGatewayTest billing={billing} busy={false} onSuccess={onRefresh} />}
      <div className="live-toolbar" style={{ marginTop: 20 }}>
        <Input placeholder="Search payments" aria-label="Search payments" value={q} onChange={e => setQ(e.target.value)} />
        <select aria-label="Payment status" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <Button variant="outline" onClick={() => download("nina-kurain-payments.json", JSON.stringify(list, null, 2))}>Export filtered records</Button>
      </div>
      <section className="live-panel live-table">
        <table>
          <thead>
            <tr>
              <th>Payment</th>
              <th>Member</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id}>
                <td>{p.provider_payment_id}</td>
                <td>{p.display_name}<small>{p.email}</small></td>
                <td>{money(p.amount / 100)}</td>
                <td>{p.status}</td>
                <td>{date(p.paid_at ?? p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p>No verified payment records yet.</p>}
      </section>
    </>
  );
}
function drawAvatarCrop(canvas: HTMLCanvasElement, image: HTMLImageElement, zoom: number, x: number, y: number) {
  const context = canvas.getContext("2d"); if (!context) return false;
  const side = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
  const minX = side / 2, maxX = image.naturalWidth - side / 2, minY = side / 2, maxY = image.naturalHeight - side / 2;
  const cx = minX + (maxX - minX) * x, cy = minY + (maxY - minY) * y;
  context.clearRect(0, 0, canvas.width, canvas.height); context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
  context.drawImage(image, cx - side / 2, cy - side / 2, side, side, 0, 0, canvas.width, canvas.height); return true;
}
function CreatorAvatarControl({
  avatarUrl,
  avatarId,
  media,
  act,
  busy,
  onAvatarUpdated,
}: {
  avatarUrl: string;
  avatarId: string;
  media: { data?: { media: Asset[] } | null; loading: boolean; error: string; refresh: () => Promise<void> };
  act: Act;
  busy: boolean;
  onAvatarUpdated: (id: string, url: string) => void;
}) {
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [mediaSearch, setMediaSearch] = useState("");
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  const [source, setSource] = useState(""), [zoom, setZoom] = useState(1), [x, setX] = useState(.5), [y, setY] = useState(.5), [working, setWorking] = useState(false), [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null), imageRef = useRef<HTMLImageElement | null>(null), dragRef = useRef<{ x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);
  useEffect(() => {
    if (!source) return;
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      if (canvasRef.current) drawAvatarCrop(canvasRef.current, image, zoom, x, y);
    };
    image.onerror = () => setMessage("The image could not be read.");
    image.src = source;
    return () => { if (imageRef.current === image) imageRef.current = null; };
  }, [source]);
  useEffect(() => {
    if (canvasRef.current && imageRef.current) drawAvatarCrop(canvasRef.current, imageRef.current, zoom, x, y);
  }, [zoom, x, y]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setMessage("The image must be 25 MB or smaller.");
      return;
    }
    if (source) URL.revokeObjectURL(source);
    setMessage("");
    setZoom(1);
    setX(.5);
    setY(.5);
    setSource(URL.createObjectURL(file));
    event.target.value = "";
    setAskModalOpen(false);
  }

  function beginDrag(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
  }
  function moveDrag(event: ReactPointerEvent<HTMLCanvasElement>) {
    const last = dragRef.current;
    if (!last) return;
    const rect = event.currentTarget.getBoundingClientRect(), factor = 1 / Math.max(.1, 1 - 1 / zoom);
    setX(value => Math.min(1, Math.max(0, value - (event.clientX - last.x) / rect.width * factor)));
    setY(value => Math.min(1, Math.max(0, value - (event.clientY - last.y) / rect.height * factor)));
    dragRef.current = { x: event.clientX, y: event.clientY };
  }
  function endDrag(event: ReactPointerEvent<HTMLCanvasElement>) {
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function wheel(event: ReactWheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    setZoom(value => Math.min(3, Math.max(1, value + (event.deltaY < 0 ? .12 : -.12))));
  }

  async function saveCrop() {
    const image = imageRef.current;
    if (!image) return;
    setWorking(true);
    setMessage("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 900;
      if (!drawAvatarCrop(canvas, image, zoom, x, y)) throw new Error("Crop preview is unavailable.");
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(value => value ? resolve(value) : reject(new Error("The crop could not be created.")), "image/jpeg", .92)
      );
      const uploaded = await upload(new File([blob], "creator-profile-crop.jpg", { type: "image/jpeg" }), () => { });
      const saved = await act("avatar", { creator_avatar_asset_id: uploaded.id });
      if (saved) {
        onAvatarUpdated(uploaded.id, uploaded.url);
        setSource("");
        setAskModalOpen(false);
        void media.refresh();
      } else {
        setMessage("The photo uploaded, but could not be applied. Please retry.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the cropped image.");
    } finally {
      setWorking(false);
    }
  }

  async function selectAssetForCrop(asset: Asset) {
    setApplying(true);
    setMessage("");
    try {
      const res = await fetch(asset.url);
      if (!res.ok) throw new Error("Could not load image from media library.");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      if (source) URL.revokeObjectURL(source);
      setZoom(1);
      setX(.5);
      setY(.5);
      setSource(objectUrl);
      setMediaPickerOpen(false);
      setAskModalOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load selected photo for cropping.");
    } finally {
      setApplying(false);
    }
  }

  const imageAssets = (media.data?.media ?? []).filter(
    m => m.mime.startsWith("image/") && m.name.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  return (
    <div className="admin-creator-profile">
      <div
        className="admin-creator-avatar avatar-clickable-preview"
        onClick={() => setAskModalOpen(true)}
        title="Click to change profile photo"
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setAskModalOpen(true); }}
      >
        {avatarUrl ? <img src={avatarUrl} alt="Creator profile" /> : <span>NK</span>}
        <span className="avatar-edit-overlay"><Pencil size={20} /></span>
      </div>

      <div>
        <strong>Creator profile photo</strong>
        <small>Select a photo from your studio library or upload a new photo from your device.</small>

        <div className="avatar-action-buttons">
          <Button
            type="button"
            onClick={() => setAskModalOpen(true)}
            disabled={busy || working || applying}
          >
            <Pencil size={15} /> Change photo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setMediaPickerOpen(true)}
            disabled={busy || working || applying}
          >
            <ImagePlus size={15} /> Choose from media
          </Button>
          <label className="avatar-choose">
            <Upload size={15} /> Upload new
            <input
              ref={fileInputRef}
              aria-label="Upload profile photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={busy || working || applying}
            />
          </label>
        </div>

        {message && <Notice>{message}</Notice>}
      </div>

      {/* 1. Prompt Modal: Ask "Choose from Media" or "Upload New" */}
      <Dialog open={askModalOpen} onOpenChange={setAskModalOpen}>
        <DialogContent className="live-dialog" style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>Update creator profile photo</DialogTitle>
            <DialogDescription>
              Choose how you would like to set your profile picture:
            </DialogDescription>
          </DialogHeader>

          <div className="avatar-source-grid">
            <button
              type="button"
              className="avatar-source-card"
              onClick={() => {
                setAskModalOpen(false);
                setMediaPickerOpen(true);
              }}
            >
              <div className="avatar-source-icon">
                <ImagePlus size={26} />
              </div>
              <strong>Choose from Media Library</strong>
              <p>Pick any photo already stored in your studio, then adjust and crop framing.</p>
              <span className="badge">No re-upload · Crop &amp; Adjust</span>
            </button>

            <button
              type="button"
              className="avatar-source-card"
              onClick={() => {
                setAskModalOpen(false);
                fileInputRef.current?.click();
              }}
            >
              <div className="avatar-source-icon">
                <Upload size={26} />
              </div>
              <strong>Upload New Photo</strong>
              <p>Select a new photo file from your phone or PC with interactive zoom &amp; crop.</p>
              <span className="badge">From Device</span>
            </button>
          </div>

          <div className="live-toolbar">
            <Button type="button" variant="outline" onClick={() => setAskModalOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Media Library Browser Dialog */}
      <Dialog open={mediaPickerOpen} onOpenChange={open => { if (!open && !applying) { setMediaPickerOpen(false); setSelectedAsset(null); } }}>
        <DialogContent className="live-dialog avatar-media-dialog" style={{ maxWidth: 680 }}>
          <DialogHeader>
            <DialogTitle>Choose photo from studio library</DialogTitle>
            <DialogDescription>
              Select a photo to adjust framing and set as your creator profile picture.
            </DialogDescription>
          </DialogHeader>

          <div className="avatar-media-picker-body">
            <div className="live-toolbar" style={{ margin: 0 }}>
              <Input
                placeholder="Search studio images…"
                value={mediaSearch}
                onChange={e => setMediaSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload new instead
              </Button>
            </div>

            {media.loading && <p style={{ color: "#aaa", fontSize: 13 }}>Loading media library…</p>}
            {media.error && <Notice>{media.error}</Notice>}

            <div className="avatar-media-grid">
              {imageAssets.map(asset => {
                const isSelected = (selectedAsset ? selectedAsset.id === asset.id : avatarId === asset.id);
                return (
                  <div
                    key={asset.id}
                    className={`avatar-media-cell ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedAsset(asset)}
                    onDoubleClick={() => void selectAssetForCrop(asset)}
                    title={`Click to select ${asset.name} (Double-click to adjust & crop)`}
                  >
                    <img src={asset.url} alt={asset.name} loading="lazy" />
                    <span className="cell-name">{asset.name}</span>
                    {isSelected && (
                      <span className="selected-check">
                        <Check size={13} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {!media.loading && !imageAssets.length && (
              <div className="live-empty" style={{ padding: "20px 10px" }}>
                <p>No image files found in your media library.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMediaPickerOpen(false);
                    fileInputRef.current?.click();
                  }}
                  style={{ marginTop: 10 }}
                >
                  <Upload size={14} /> Upload new photo instead
                </Button>
              </div>
            )}
          </div>

          <div className="live-toolbar" style={{ marginTop: 16 }}>
            <Button
              type="button"
              variant="outline"
              disabled={applying}
              onClick={() => { setMediaPickerOpen(false); setSelectedAsset(null); }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedAsset || applying}
              onClick={() => { if (selectedAsset) void selectAssetForCrop(selectedAsset); }}
            >
              {applying ? "Loading photo…" : "Adjust & Crop Photo →"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Crop dialog for uploaded photos */}
      <Dialog open={Boolean(source)} onOpenChange={open => { if (!open && !working) setSource(""); }}>
        <DialogContent className="live-dialog avatar-crop-dialog">
          <DialogHeader>
            <DialogTitle>Frame your profile photo</DialogTitle>
            <DialogDescription>Drag to reposition and use the mouse wheel or slider to zoom. The saved photo will match this preview exactly.</DialogDescription>
          </DialogHeader>
          <div className={`avatar-crop-frame ${dragging ? "dragging" : ""}`}>
            <canvas
              ref={canvasRef}
              width={720}
              height={720}
              aria-label="Profile crop preview"
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onWheel={wheel}
            />
          </div>
          <p className="avatar-crop-hint">Drag to move · Scroll to zoom</p>
          <div className="avatar-crop-controls">
            <label>
              Zoom <strong>{zoom.toFixed(2)}×</strong>
              <input type="range" min="1" max="3" step="0.02" value={zoom} onChange={event => setZoom(Number(event.target.value))} />
            </label>
            <div className="live-toolbar">
              <Button type="button" variant="outline" disabled={working} onClick={() => { setZoom(1); setX(.5); setY(.5); }}>Reset framing</Button>
            </div>
          </div>
          <div className="live-toolbar">
            <Button type="button" variant="outline" disabled={working} onClick={() => setSource("")}>Cancel</Button>
            <Button type="button" disabled={working} onClick={() => void saveCrop()}>{working ? "Uploading and applying…" : "Use this crop"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function FeedbackInbox({ items, act, busy }: { items: any[]; act: Act; busy: boolean }) { const [status, setStatus] = useState("all"), [rating, setRating] = useState("all"); const filtered = items.filter(item => (status === "all" || item.status === status) && (rating === "all" || item.rating === Number(rating))); return <><Title title="Member feedback." copy="A private line from your members to the studio. Review ideas, experience notes and technical reports." /><div className="live-toolbar"><select aria-label="Feedback status" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All feedback</option><option value="new">New</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option></select><select aria-label="Feedback rating" value={rating} onChange={event => setRating(event.target.value)}><option value="all">All ratings</option>{[5, 4, 3, 2, 1].map(value => <option value={value} key={value}>{value} stars</option>)}</select></div><section className="feedback-inbox">{filtered.map(item => <article className={`feedback-ticket ${item.status}`} key={item.id}><header><div><strong>{item.display_name}</strong><small>{item.email} · {date(item.created_at)}</small></div><span className={`feedback-status ${item.status}`}>{item.status}</span></header><div className="feedback-ticket-meta"><span>{item.category.replaceAll("_", " ")}</span><span className="feedback-stars">{[1, 2, 3, 4, 5].map(value => <Star key={value} size={14} fill={value <= item.rating ? "currentColor" : "none"} />)}</span>{Boolean(item.contact_okay) && <span>Contact welcome</span>}</div><p>{item.message}</p><div className="live-toolbar"><Button variant="outline" disabled={busy || item.status === "reviewed"} onClick={() => void act("feedback-status", { id: item.id, status: "reviewed" })}>Mark reviewed</Button><Button disabled={busy || item.status === "resolved"} onClick={() => void act("feedback-status", { id: item.id, status: "resolved" })}>Resolve</Button></div></article>)}{!filtered.length && <div className="live-empty"><MessageSquareText size={28} /><h2>No feedback in this view.</h2><p>New member notes will appear here in real time.</p></div>}</section></> }
function SettingsEditor({ data, act, busy }: { data: any; act: Act; busy: boolean }) {
  const settings = Object.fromEntries(data.settings.map((x: any) => [x.key, x.value])), drive = data.drive ?? { configured: false, connected: false, driveAssets: 0, legacyAssets: 0 };
  const [likes, setLikes] = useState(settings.likes_enabled !== "false"), [verify, setVerify] = useState(settings.require_verification === "true"), [avatarId, setAvatarId] = useState(settings.creator_avatar_asset_id ?? ""), [avatarUrl, setAvatarUrl] = useState(""), [disconnectArmed, setDisconnectArmed] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(settings.ads_enabled === "true");
  const [adsHideForPaid, setAdsHideForPaid] = useState(settings.ads_hide_for_paid !== "false");
  const [adsenseClient, setAdsenseClient] = useState(settings.ads_adsense_client ?? "");
  const [inFeedSlot, setInFeedSlot] = useState(settings.ads_in_feed_slot ?? "");
  const [bannerSlot, setBannerSlot] = useState(settings.ads_banner_slot ?? "");
  const [customHtml, setCustomHtml] = useState(settings.ads_custom_html ?? "");
  const [adsTxt, setAdsTxt] = useState(settings.ads_txt_content ?? "");
  const media = useData<{ media: Asset[] }>("/api/studio/media", 60000);
  useEffect(() => { if (!avatarUrl && avatarId) { const found = media.data?.media.find(m => m.id === avatarId); if (found) setAvatarUrl(found.url); } }, [avatarId, avatarUrl, media.data]);
  return <><Title title="Studio settings." copy="Manage the creator identity, monetization, private storage, appearance and community preferences." />
    <DatabaseStorageManager storage={data.storage} act={act} busy={busy} />
    <section className="live-panel drive-storage-card"><div className="settings-card-heading"><span className="settings-icon"><HardDrive size={18} /></span><div><h2>Google Drive media storage</h2><p>Connect only the Google account you want to own this studio’s private photos and films.</p></div></div>
      {!drive.configured ? <div className="drive-status"><span className="drive-status-pill waiting">AWAITING SETUP</span><div><strong>No Google account has been connected.</strong><p>Add the Google OAuth environment credentials first. Your current media continues working in the existing private store.</p></div></div> : !drive.connected ? <div className="drive-status"><span className="drive-status-pill waiting">NOT CONNECTED</span><div><strong>Ready for the intended Google account.</strong><p>Google opens its own secure sign-in screen. Never enter or share the Gmail password inside Nina Kurain's club.</p><a className="button" href="/api/integrations/google-drive/start"><CloudUpload size={16} />Connect intended Google account</a></div></div> : <div className="drive-connected"><div className="drive-status"><span className="drive-status-pill connected">CONNECTED</span><div><strong>{drive.displayName || "Google Drive"}</strong><p>{drive.accountEmail}</p></div></div><div className="drive-counts"><span><b>{drive.driveAssets}</b> files in Google Drive</span><span><b>{drive.legacyAssets}</b> files awaiting migration</span></div>{drive.quota && <div style={{ marginTop: 12, marginBottom: 16, background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: 14, border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}><div><span style={{ fontSize: 11, color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em" }}>Drive Storage Availability</span><div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 2 }}>{formatBytes(drive.quota.usage)} {drive.quota.limit ? <span style={{ fontSize: 12, color: "#a88e9c", fontWeight: 400 }}>/ {formatBytes(drive.quota.limit)}</span> : ""}</div></div>{drive.quota.available !== undefined && <div style={{ textAlign: "right" }}><span style={{ fontSize: 11, color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em" }}>Free Space</span><div style={{ fontSize: 17, fontWeight: 700, color: "#4ade80", marginTop: 2 }}>{formatBytes(drive.quota.available)}</div></div>}</div>{drive.quota.limit && <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, margin: "10px 0 6px", overflow: "hidden" }}><div style={{ width: `${Math.min(100, Math.max(2, drive.quota.usagePercent ?? 0))}%`, height: "100%", background: (drive.quota.usagePercent ?? 0) > 85 ? "#ef4444" : "linear-gradient(90deg, #e56b83 0%, #4ade80 100%)", borderRadius: 999 }} /></div>}<div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginTop: 4 }}><span>Drive media: {formatBytes(drive.quota.usageInDrive)}</span><span>Drive trash: {formatBytes(drive.quota.usageInDriveTrash)}</span></div></div>}<p>New uploads now save to this account. Files stay private and members receive them only after the server verifies their membership.</p><div className="live-toolbar">{drive.legacyAssets > 0 && <Button type="button" disabled={busy} onClick={() => void act("migrate-google-drive", {})}><CloudUpload size={16} />Move next files to Drive</Button>}{drive.quota && drive.quota.usageInDriveTrash > 0 && <Button type="button" variant="outline" disabled={busy} onClick={() => void act("empty-drive-trash", {})}>Empty Drive Trash ({formatBytes(drive.quota.usageInDriveTrash)})</Button>}{!disconnectArmed ? <Button type="button" variant="outline" disabled={busy} onClick={() => setDisconnectArmed(true)}><Unplug size={16} />Disconnect</Button> : <><Button type="button" variant="outline" disabled={busy} onClick={() => setDisconnectArmed(false)}>Keep connected</Button><Button type="button" variant="destructive" disabled={busy} onClick={async () => { if (await act("disconnect-google-drive", {})) setDisconnectArmed(false); }}>Confirm disconnect</Button></>}</div>{disconnectArmed && <Notice>Disconnecting does not delete Drive files, but Drive-hosted media cannot be displayed until this account is reconnected.</Notice>}</div>}
    </section>
    <section className="live-panel integration-readiness"><div className="settings-card-heading"><span className="settings-icon"><MailCheck size={18} /></span><div><h2>Automated member emails</h2><p>Verification, password recovery, welcome, activation, renewal, payment grace, expiry and membership-change messages.</p></div></div><div className="drive-status"><span className={`drive-status-pill ${data.emailReady ? "connected" : "waiting"}`}>{data.emailReady ? "READY" : "NEEDS SETUP"}</span><div><strong>{data.emailReady ? "Resend delivery is configured." : "Add your verified sender and API key."}</strong><p>{Number(data.emailStats?.sent ?? 0)} sent · {Number(data.emailStats?.failed ?? 0)} failed</p></div></div>{data.emailReady ? <Button type="button" variant="outline" disabled={busy} onClick={() => void act("test-email", {})}>Send test email</Button> : <Notice>Add MAIL_API_KEY as a secret and MAIL_FROM as a verified sender address in Site environment settings.</Notice>}</section>
    <section className="live-panel integration-readiness"><div className="settings-card-heading"><span className="settings-icon"><ShieldCheck size={18} /></span><div><h2>Razorpay subscriptions</h2><p>Server-verified monthly payments with signed webhooks and a 48-hour failed-renewal grace period.</p></div></div><div className="drive-status"><span className={`drive-status-pill ${data.billing?.ready ? "connected" : "waiting"}`}>{data.billing?.ready ? `${String(data.billing.mode).toUpperCase()} READY` : "NEEDS SETUP"}</span><div><strong>{data.billing?.ready ? "Checkout and webhook verification are ready." : "Razorpay is safely disabled until configuration is complete."}</strong><p>Key environment: {data.billing?.keyMode ?? "unknown"}</p></div></div>{data.billing?.webhookUrl && <label>Webhook URL<Input value={data.billing.webhookUrl} readOnly /></label>}{data.billing?.issues?.length > 0 && <Notice>{data.billing.issues.join(" ")}</Notice>}</section>
    <RealPaymentGatewayTest billing={data.billing} busy={busy} />
    <section className="live-panel appearance-card"><div className="settings-card-heading"><span className="settings-icon"><Sparkles size={18} /></span><div><h2>Studio appearance</h2><p>Match the device automatically or choose your preferred editorial theme.</p></div></div><ThemeSelector /></section>
    <section className="live-panel"><form className="live-form" onSubmit={ev => {
      ev.preventDefault();
      void act("settings", {
        ...Object.fromEntries(new FormData(ev.currentTarget)),
        creator_avatar_asset_id: avatarId,
        likes_enabled: likes,
        require_verification: verify,
        ads_enabled: adsEnabled,
        ads_hide_for_paid: adsHideForPaid,
        ads_adsense_client: adsenseClient.trim(),
        ads_in_feed_slot: inFeedSlot.trim(),
        ads_banner_slot: bannerSlot.trim(),
        ads_custom_html: customHtml,
        ads_txt_content: adsTxt
      });
    }}>
      <CreatorAvatarControl
        avatarUrl={avatarUrl}
        avatarId={avatarId}
        media={media}
        act={act}
        busy={busy}
        onAvatarUpdated={(id, url) => {
          setAvatarId(id);
          setAvatarUrl(url);
        }}
      />
      <label>Creator name<Input name="creator_name" defaultValue={settings.creator_name ?? "Nina Kurain"} required maxLength={100} /></label><label>Creator introduction<textarea name="creator_bio" defaultValue={settings.creator_bio ?? "A private collection of photographs, films and personal notes."} maxLength={1000} /></label>
      
      {/* ─── Ads & Monetization Section ─── */}
      <div className="settings-card-heading" style={{ marginTop: 24 }}>
        <span className="settings-icon"><IndianRupee size={18} /></span>
        <div>
          <h2>Ads & Monetization</h2>
          <p>Earn revenue with dedicated, UX-friendly ad slots that seamlessly match the luxury editorial aesthetic.</p>
        </div>
      </div>

      <label className="live-check">
        <Switch checked={adsEnabled} onCheckedChange={setAdsEnabled} />
        <span>
          <strong>Enable dedicated ad spaces</strong>
          <small style={{ display: "block", color: "#a58b99", fontSize: 12 }}>
            Activates non-intrusive In-Feed sponsor slots and header banners.
          </small>
        </span>
      </label>

      <label className="live-check">
        <Switch checked={adsHideForPaid} onCheckedChange={setAdsHideForPaid} />
        <span>
          <strong>Ad-free experience for paying members (Recommended)</strong>
          <small style={{ display: "block", color: "#a58b99", fontSize: 12 }}>
            Free demo visitors see ads; paying subscribers enjoy an exclusive 100% ad-free experience.
          </small>
        </span>
      </label>

      {adsEnabled && (
        <div style={{ background: "rgba(229, 107, 131, 0.05)", border: "1px solid rgba(229, 107, 131, 0.2)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <strong style={{ fontSize: 14, color: "#fff" }}>Google AdSense Integration</strong>
            <a href="https://adsense.google.com" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#ff85ad", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Open AdSense Console <ExternalLink size={12} />
            </a>
          </div>

          <label>
            Google AdSense Publisher / Client ID
            <Input
              placeholder="ca-pub-1234567890123456"
              value={adsenseClient}
              onChange={e => setAdsenseClient(e.target.value)}
            />
            <small style={{ color: "#a58b99", fontSize: 11.5 }}>
              Find this in your Google AdSense Account Settings (starts with <code>ca-pub-</code>).
            </small>
          </label>

          <div className="live-grid">
            <label>
              In-Feed Ad Unit Slot ID (Optional)
              <Input
                placeholder="e.g. 9876543210"
                value={inFeedSlot}
                onChange={e => setInFeedSlot(e.target.value)}
              />
            </label>
            <label>
              Banner Ad Unit Slot ID (Optional)
              <Input
                placeholder="e.g. 1234567890"
                value={bannerSlot}
                onChange={e => setBannerSlot(e.target.value)}
              />
            </label>
          </div>

          <label>
            Custom Sponsor Banner / Partner HTML (Optional fallback)
            <textarea
              placeholder="Paste affiliate HTML, banner image tags, or sponsor script here…"
              value={customHtml}
              onChange={e => setCustomHtml(e.target.value)}
              rows={3}
              style={{ fontFamily: "monospace", fontSize: 12 }}
            />
            <small style={{ color: "#a58b99", fontSize: 11.5 }}>
              Used when you run direct paid sponsorships or alternative ad networks.
            </small>
          </label>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ margin: 0 }}>ads.txt Content (Required by Google AdSense)</label>
              {adsenseClient && (
                <button
                  type="button"
                  style={{ background: "transparent", border: "none", color: "#ff85ad", fontSize: 11.5, cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => {
                    const pub = adsenseClient.replace(/^ca-/, "").trim();
                    setAdsTxt(`google.com, ${pub}, DIRECT, f08c47fec0942fa0`);
                  }}
                >
                  Generate Google Line
                </button>
              )}
            </div>
            <textarea
              placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
              value={adsTxt}
              onChange={e => setAdsTxt(e.target.value)}
              rows={2}
              style={{ fontFamily: "monospace", fontSize: 12 }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <small style={{ color: "#a58b99", fontSize: 11.5 }}>
                Served automatically at <code>/ads.txt</code> to verify your domain ownership with Google.
              </small>
              <a href="/ads.txt" target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "#ff85ad", display: "inline-flex", alignItems: "center", gap: 3 }}>
                View live /ads.txt <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="settings-card-heading"><span className="settings-icon"><Globe2 size={18} /></span><div><h2>Creator links</h2><p>Add full https:// links. Empty fields stay hidden from visitors and members.</p></div></div><label><Globe2 size={16} /> Instagram<Input name="creator_instagram" type="url" inputMode="url" placeholder="https://instagram.com/youraccount" defaultValue={settings.creator_instagram ?? ""} /></label><label><Globe2 size={16} /> YouTube<Input name="creator_youtube" type="url" inputMode="url" placeholder="https://youtube.com/@yourchannel" defaultValue={settings.creator_youtube ?? ""} /></label><label><Globe2 size={16} /> Facebook<Input name="creator_facebook" type="url" inputMode="url" placeholder="https://facebook.com/yourpage" defaultValue={settings.creator_facebook ?? ""} /></label><label><Globe2 size={16} /> Pinterest<Input name="creator_pinterest" type="url" inputMode="url" placeholder="https://pinterest.com/youraccount" defaultValue={settings.creator_pinterest ?? ""} /></label><label><Globe2 size={16} /> Website<Input name="creator_website" type="url" inputMode="url" placeholder="https://yourwebsite.com" defaultValue={settings.creator_website ?? ""} /></label><label className="live-check"><Switch checked={likes} onCheckedChange={setLikes} />Enable likes on accessible posts</label><label className="live-check"><Switch checked={verify} onCheckedChange={setVerify} disabled={!data.emailReady} />Require verified email before viewing content</label>{!data.emailReady && <Notice>Email verification can be required after email delivery is configured.</Notice>}<Button type="submit" disabled={busy}>Save creator profile and links</Button></form></section></>;
}
