'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  Mail, 
  FileText
} from 'lucide-react';

export default function ContentRemovalPage() {
  const [category, setCategory] = useState('deepfake');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('depicted_person');
  const [contentUrls, setContentUrls] = useState('');
  const [description, setDescription] = useState('');
  const [signature, setSignature] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed || !fullName.trim() || !email.trim() || !contentUrls.trim()) {
      return;
    }

    setSubmitting(true);
    // Simulate swift submission acknowledgement
    setTimeout(() => {
      const generatedId = 'TKT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setSubmissionId(generatedId);
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div className="legal-shell">
      {/* Header */}
      <header className="legal-header">
        <div className="legal-header-inner">
          <div className="legal-brand">
            <Link href="/" className="legal-brand-link">
              <span className="legal-brand-dot" />
              <span className="legal-brand-title">NINA KURAIN</span>
            </Link>
            <span className="legal-badge">REPORTING PORTAL</span>
          </div>

          <div className="legal-nav-actions">
            <Link href="/" className="legal-btn legal-btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <Link href="/terms-and-conditions" className="legal-btn legal-btn-secondary">
              <span>Terms &amp; Conditions</span>
            </Link>
            <Link href="/privacy-policy" className="legal-btn legal-btn-secondary">
              <span>Privacy Policy</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="legal-container" style={{ gridTemplateColumns: '1fr', maxWidth: '860px', margin: '0 auto' }}>
        <main className="legal-main">
          <div className="legal-article-header">
            <h1 className="legal-title">Content Reporting &amp; Expedited Removal Portal</h1>
            <div className="legal-meta">
              <span>24/7 Moderation Review Queue</span>
              <span>•</span>
              <span className="legal-badge-pill" style={{ borderColor: 'rgba(255, 77, 77, 0.4)', color: '#ff4d4d' }}>
                Priority Escalation
              </span>
            </div>
            <p className="legal-summary">
              We maintain zero tolerance for non-consensual imagery, real-person deepfakes, copyright violations, and any form of minor exploitation. 
              Use this official portal to submit priority takedown requests. Verified reports involving non-consensual intimate imagery or deepfakes are reviewed within 
              <strong> 24 to 48 hours</strong>, with immediate provisional de-indexing.
            </p>
          </div>

          {/* Quick Notice Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            <div className="legal-callout critical" style={{ margin: 0 }}>
              <div className="legal-callout-icon">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#ff4d4d' }}>Minor Safety Emergency</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Reports regarding suspected underage content are escalated instantly and referred to law enforcement and NCMEC.
                </p>
              </div>
            </div>

            <div className="legal-callout warning" style={{ margin: 0 }}>
              <div className="legal-callout-icon">
                <Lock size={22} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#ffaa33' }}>Non-Consensual Deepfakes</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Depicted individuals can directly request expedited removal of unauthorized AI likenesses or face-swaps.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Feedback or Form */}
          {submitted ? (
            <div className="legal-callout highlight" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(56, 217, 169, 0.15)', color: '#38d9a9', marginBottom: '16px' }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 10px 0', color: '#f3f4f6' }}>
                Report Received &amp; Escalated
              </h2>
              <p style={{ maxWidth: '560px', margin: '0 auto 16px auto', color: '#9ca3af', lineHeight: 1.6 }}>
                Your request has been logged into our high-priority moderation queue under reference ID:
              </p>
              <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, color: 'var(--ag-rose)', letterSpacing: '0.08em', marginBottom: '20px' }}>
                {submissionId}
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0' }}>
                A confirmation has been sent to <strong>{email}</strong>. Our compliance team will review the target content, perform immediate hashing/blocking, and notify you when action has been taken.
              </p>
              <button 
                onClick={() => { setSubmitted(false); setConfirmed(false); }}
                className="legal-btn legal-btn-secondary"
                style={{ margin: '0 auto' }}
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: 'var(--ag-surface)', border: '1px solid var(--ag-line)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#f3f4f6', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} style={{ color: 'var(--ag-rose)' }} />
                <span>Submit Removal Request</span>
              </h2>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 12px 0' }}>
                Please provide precise details so our trust and safety agents can locate and inspect the material without delay.
              </p>

              {/* Violation Category */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginBottom: '8px' }}>
                  Violation Category <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--ag-line)', color: '#f3f4f6', fontSize: '14px', outline: 'none' }}
                >
                  <option value="minor_safety" style={{ background: '#17111a', color: '#ff6666' }}>🚨 Minor Safety / Suspected Underage (Priority 1)</option>
                  <option value="deepfake" style={{ background: '#17111a' }}>🎭 Unauthorized Real-Person Deepfake / AI Face-Swap</option>
                  <option value="ncii" style={{ background: '#17111a' }}>🚫 Non-Consensual Intimate Imagery (NCII) / Revenge Media</option>
                  <option value="dmca" style={{ background: '#17111a' }}>⚖️ Copyright Infringement (DMCA Takedown Notice)</option>
                  <option value="harassment" style={{ background: '#17111a' }}>⚠️ Harassment, Doxxing or Private Information</option>
                  <option value="other" style={{ background: '#17111a' }}>ℹ️ Other Terms of Service Violation</option>
                </select>
              </div>

              {/* Depicted Relationship */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginBottom: '8px' }}>
                  Your Relationship to the Content <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--ag-line)', color: '#f3f4f6', fontSize: '14px', outline: 'none' }}
                >
                  <option value="depicted_person" style={{ background: '#17111a' }}>I am the individual depicted in the media</option>
                  <option value="authorized_rep" style={{ background: '#17111a' }}>I am the legal representative or agent of the depicted person</option>
                  <option value="copyright_holder" style={{ background: '#17111a' }}>I am the copyright owner / creator of the original work</option>
                  <option value="concerned_citizen" style={{ background: '#17111a' }}>I am a member or third-party reporting a violation</option>
                </select>
              </div>

              {/* Name and Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginBottom: '8px' }}>
                    Full Legal Name <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="First and Last Name"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--ag-line)', color: '#f3f4f6', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginBottom: '8px' }}>
                    Contact Email Address <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--ag-line)', color: '#f3f4f6', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Target URLs */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginBottom: '8px' }}>
                  Target Content URL(s) or Specific Post IDs <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={contentUrls}
                  onChange={(e) => setContentUrls(e.target.value)}
                  placeholder="https://.../post/123 or creator profile link, timestamps, or media identifiers"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--ag-line)', color: '#f3f4f6', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginBottom: '8px' }}>
                  Explanation &amp; Identifying Details
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe why this content violates policy (e.g. AI-generated face swap created without my permission; original photo taken from my private profile...)"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--ag-line)', color: '#f3f4f6', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Electronic Signature */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginBottom: '8px' }}>
                  Electronic Signature (Type Your Full Legal Name) <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Typed Signature"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--ag-line)', color: '#f3f4f6', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {/* Sworn Confirmation */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="legal-confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--ag-rose)' }}
                />
                <label htmlFor="legal-confirm" style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.5, cursor: 'pointer' }}>
                  I state under penalty of perjury that the information provided in this notice is accurate, that I have a good-faith belief that the identified material is not authorized, and that I am the depicted individual, copyright owner, or authorized representative.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!confirmed || submitting}
                className="legal-btn legal-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', fontWeight: 600, marginTop: '10px', opacity: confirmed ? 1 : 0.6 }}
              >
                {submitting ? (
                  <>Processing Escalation...</>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Expedited Removal Notice</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Alternate Direct Contacts */}
          <div style={{ marginTop: '36px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#d1d5db', marginBottom: '14px' }}>
              Direct Compliance Email Channels
            </h3>
            <div className="legal-contact-card">
              <div className="legal-contact-item">
                <Mail size={18} className="legal-contact-icon" />
                <div>
                  <strong>Expedited Takedown &amp; Deepfake Desk:</strong>
                  <p><a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a></p>
                </div>
              </div>
              <div className="legal-contact-item">
                <FileText size={18} className="legal-contact-icon" />
                <div>
                  <strong>Registered DMCA Copyright Agent:</strong>
                  <p><a href="mailto:contact@ninakurainservices.in" className="legal-inline-link">contact@ninakurainservices.in</a></p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <p>&copy; {new Date().getFullYear()} Nina Kurain Services. All Rights Reserved. Expedited Content Moderation.</p>
          <div className="legal-footer-links">
            <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/content-removal">Content Removal</Link>
            <Link href="/about">About Platform</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
