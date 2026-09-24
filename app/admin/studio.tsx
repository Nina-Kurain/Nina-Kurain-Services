"use client";

import { ArrowUpRight, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export function AdminStudio() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      title: String(form.get("title") ?? ""), caption: String(form.get("caption") ?? ""),
      visibility: String(form.get("visibility") ?? "free"), status: String(form.get("status") ?? "draft"),
    };
    const file = form.get("file");
    if (file instanceof File && file.size > 0) {
      const media = new FormData(); media.set("file", file);
      const uploadResponse = await fetch("/api/admin/media", { method: "POST", body: media });
      const uploaded = await uploadResponse.json() as { key?: string; message?: string };
      if (!uploadResponse.ok || !uploaded.key) { setStatus(uploaded.message || "Media upload failed."); setBusy(false); return; }
      payload.mediaKey = uploaded.key;
    }
    const response = await fetch("/api/admin/posts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json() as { message?: string };
    setStatus(result.message || (response.ok ? "Post saved." : "Could not save the post."));
    if (response.ok) event.currentTarget.reset();
    setBusy(false);
  }
  return <div className="admin-grid"><section className="admin-card"><h2>Membership snapshot</h2><div className="metric-grid"><div className="metric"><strong>2,418</strong><span>REGISTERED MEMBERS</span></div><div className="metric"><strong>612</strong><span>ACTIVE SUBSCRIBERS</span></div><div className="metric"><strong>₹5.4L</strong><span>MONTHLY RECURRING</span></div><div className="metric"><strong>8</strong><span>IN GRACE PERIOD</span></div></div><p className="admin-note">Sample overview values are shown until live payment analytics are connected.</p></section><section className="admin-card"><h2>Create a post</h2><form className="admin-form" onSubmit={createPost}><label>Title<input name="title" required maxLength={120} placeholder="A quiet morning in the studio" /></label><label>Caption<textarea name="caption" required maxLength={3000} placeholder="Write the story behind this drop…" /></label><label>Protected image or video<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime" /></label><label>Who can see it?<select name="visibility" defaultValue="free"><option value="free">Free members</option><option value="insider">Insider+</option><option value="premium">Premium+</option><option value="vip">VIP only</option></select></label><label>Publish state<select name="status" defaultValue="draft"><option value="draft">Draft</option><option value="published">Published</option></select></label><button className="button" disabled={busy}>{busy ? <Loader2 className="spin" size={16} /> : <>SAVE POST <ArrowUpRight size={15} /></>}</button>{status && <p className="form-status" role="status">{status}</p>}</form></section></div>;
}
