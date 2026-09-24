"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Send, Loader2 } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate reliable dispatch
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
          Message Transmitted Successfully
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
          Thank you, <strong>{formData.name || "friend"}</strong>. Your transmission has been received
          by Nina Kurain Studio. Direct responses are typically issued within 24–48 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormData({ name: "", email: "", subject: "", message: "" });
            setStatus("idle");
          }}
          className="btn-secondary"
          style={{ margin: "0 auto" }}
        >
          <span>Send Another Message</span>
        </button>
      </div>
    );
  }

  return (
    <form className="collab-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="c-name">Full Name</label>
        <input
          id="c-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Elena Rostova"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="c-email">Email Address</label>
        <input
          id="c-email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your.email@example.com"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="c-subject">Subject</label>
        <input
          id="c-subject"
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Collaboration / Media / Booking / General"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="c-message">Message</label>
        <textarea
          id="c-message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Write your inquiry or proposal details here..."
          className="form-textarea"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary"
        style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Transmitting...</span>
          </>
        ) : (
          <>
            <span>Transmit Message</span>
            <ArrowRight size={14} />
          </>
        )}
      </button>
    </form>
  );
}
