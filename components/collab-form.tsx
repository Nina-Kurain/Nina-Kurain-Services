"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, Loader2 } from "lucide-react";

export function CollabForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brand: "",
    scope: "lookbook",
    timeline: "",
    proposal: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div
        className="collab-success"
        style={{
          padding: "36px 28px",
          background: "var(--nk-surface)",
          border: "1px solid var(--nk-border)",
          borderRadius: "var(--nk-radius-md)",
          textAlign: "center",
        }}
      >
        <CheckCircle2 size={42} style={{ color: "#34d399", margin: "0 auto 16px" }} />
        <h3
          style={{
            fontFamily: "var(--nk-font-serif)",
            fontSize: "22px",
            color: "var(--nk-text)",
            margin: "0 0 10px",
          }}
        >
          Partnership Proposal Received
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "var(--nk-text-muted)",
            maxWidth: "460px",
            margin: "0 auto 20px",
            lineHeight: 1.6,
          }}
        >
          Thank you for considering Nina Kurain for your brand vision. Studio management reviews all briefs
          for artistic and commercial alignment and will follow up within 24–48 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              brand: "",
              scope: "lookbook",
              timeline: "",
              proposal: "",
            });
            setStatus("idle");
          }}
          className="btn-secondary"
          style={{ margin: "0 auto" }}
        >
          <span>Submit Another Brief</span>
        </button>
      </div>
    );
  }

  return (
    <form className="collab-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="collab-name">Your Name</label>
        <input
          id="collab-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Brand Director / Creative Producer"
          className="form-input"
        />
      </div>

      <div className="form-group" style={{ marginTop: "12px" }}>
        <label htmlFor="collab-brand">Brand / Publication / Agency</label>
        <input
          id="collab-brand"
          type="text"
          required
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          placeholder="e.g. Maison Atelier / Vogue Editorial"
          className="form-input"
        />
      </div>

      <div className="form-group" style={{ marginTop: "12px" }}>
        <label htmlFor="collab-email">Business Email</label>
        <input
          id="collab-email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="partnerships@brand.com"
          className="form-input"
        />
      </div>

      <div className="form-group" style={{ marginTop: "12px" }}>
        <label htmlFor="collab-scope">Project Scope</label>
        <select
          id="collab-scope"
          value={formData.scope}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          className="form-input"
          style={{ background: "var(--nk-surface)", color: "var(--nk-text)" }}
        >
          <option value="lookbook">Fashion Lookbook &amp; Campaign</option>
          <option value="editorial">Magazine Editorial &amp; Cover Story</option>
          <option value="cinematography">Studio Cinematography &amp; Motion</option>
          <option value="ambassadorship">Long-Term Brand Ambassadorship</option>
          <option value="licensing">Media &amp; Visual Art Licensing</option>
        </select>
      </div>

      <div className="form-group" style={{ marginTop: "12px" }}>
        <label htmlFor="collab-timeline">Proposed Timeline / Launch Date</label>
        <input
          id="collab-timeline"
          type="text"
          value={formData.timeline}
          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          placeholder="e.g. Q4 2026 / November Campaign"
          className="form-input"
        />
      </div>

      <div className="form-group" style={{ marginTop: "12px" }}>
        <label htmlFor="collab-msg">Campaign Proposal &amp; Vision</label>
        <textarea
          id="collab-msg"
          required
          rows={4}
          value={formData.proposal}
          onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
          placeholder="Describe your creative vision, deliverables, and intended distribution channels..."
          className="form-textarea"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary"
        style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Submitting Proposal...</span>
          </>
        ) : (
          <>
            <span>Submit Collaboration Proposal</span>
            <ArrowRight size={14} />
          </>
        )}
      </button>
    </form>
  );
}
