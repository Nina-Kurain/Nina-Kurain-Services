"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Check, Users, Sparkles, Share2, Crown, ArrowRight, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralMilestone {
  milestone: number;
  required: number;
  tierLevel: number;
  planId: string;
  planName: string;
  days: number;
  achieved: boolean;
  unlocked: boolean;
  grantedAt?: number;
}

interface UserReferralData {
  referralCode: string;
  referralUrl: string;
  totalReferred: number;
  validReferred: number;
  subscribedReferred: number;
  totalSubscribed: number;
  firstReferralAt: number | null;
  windowExpiresAt: number | null;
  isWindowActive: boolean;
  windowDaysRemaining: number;
  milestones: ReferralMilestone[];
  rewards: Array<{
    milestone: number;
    planId: string;
    tierLevel: number;
    days: number;
    grantedAt: number;
    expiresAt: number;
  }>;
}

export function MemberReferralCard() {
  const [data, setData] = useState<UserReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetch("/api/app/referrals")
      .then((r) => (r.ok ? (r.json() as Promise<UserReferralData>) : null))
      .then((res) => {
        if (res && res.referralCode) setData(res);
      })
      .catch((err) => console.error("Error loading referral stats", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="admin-card referral-card">
        <div className="settings-card-heading">
          <span className="settings-icon"><Gift size={18} /></span>
          <div>
            <h2>Refer &amp; Unlock VIP Tiers</h2>
            <p>Loading your personal invite code and reward milestones…</p>
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const currentUrl = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${data.referralCode}`
    : data.referralUrl;

  const copyCode = () => {
    navigator.clipboard.writeText(data.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Join me on Nina Kurain's VIP membership! Use my invite code ${data.referralCode} to claim private access: ${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const windowEndDate = data.windowExpiresAt
    ? new Date(data.windowExpiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <section className="admin-card referral-card" style={{
      background: "linear-gradient(135deg, rgba(25, 12, 22, 0.95) 0%, rgba(15, 8, 14, 0.98) 100%)",
      border: "1px solid rgba(229, 107, 131, 0.35)",
      borderRadius: "16px",
      padding: "24px",
      marginTop: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(229, 107, 131, 0.08)"
    }}>
      <div className="settings-card-heading" style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
        <span className="settings-icon" style={{
          background: "linear-gradient(135deg, #e56b83 0%, #c44765 100%)",
          color: "#fff",
          padding: "10px",
          borderRadius: "12px",
          display: "flex",
          boxShadow: "0 4px 14px rgba(229, 107, 131, 0.4)"
        }}>
          <Gift size={20} />
        </span>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f7e6ef", margin: 0 }}>
            Invite Members &amp; Earn VIP Access
          </h2>
          <p style={{ color: "#b592a4", fontSize: "13px", marginTop: "4px" }}>
            Share your private invite code. When members subscribe to any plan, you unlock complimentary 7-day trials to higher VIP tiers. Referral counts are valid for 7 days from your first referral.
          </p>
        </div>
      </div>

      {/* 7-Day Referral Window Notice */}
      <div style={{
        marginBottom: "18px",
        padding: "12px 16px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "12.5px",
        lineHeight: "1.4",
        background: !data.firstReferralAt
          ? "rgba(255, 255, 255, 0.05)"
          : data.isWindowActive
            ? "rgba(229, 107, 131, 0.12)"
            : "rgba(239, 68, 68, 0.1)",
        border: `1px solid ${!data.firstReferralAt ? "rgba(255, 255, 255, 0.12)" : data.isWindowActive ? "rgba(229, 107, 131, 0.4)" : "rgba(239, 68, 68, 0.3)"}`,
        color: !data.firstReferralAt ? "#d1b1c2" : data.isWindowActive ? "#ffb3c5" : "#fca5a5"
      }}>
        <Clock size={18} style={{ flexShrink: 0 }} />
        <div>
          {!data.firstReferralAt ? (
            <span>
              <strong>7-Day Reward Window:</strong> Starts automatically as soon as your first member signs up with your code. All referrals made during those 7 days count toward unlocking VIP trials.
            </span>
          ) : data.isWindowActive ? (
            <span>
              <strong>7-Day Window Active ({data.windowDaysRemaining} {data.windowDaysRemaining === 1 ? "day" : "days"} left):</strong> Closes on {windowEndDate}. Only referrals joining within these 7 days count toward milestone unlocks.
            </span>
          ) : (
            <span>
              <strong>7-Day Qualification Window Ended:</strong> Your milestone window expired on {windowEndDate}. Total refers ({data.totalReferred}) continue to be tracked, but new milestone reward counting is closed.
            </span>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: "10px",
        marginBottom: "20px"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(229, 107, 131, 0.2)",
          borderRadius: "10px",
          padding: "12px 10px",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "10.5px", color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
            Total Refers
          </span>
          <strong style={{ fontSize: "20px", color: "#fff", fontWeight: "800", marginTop: "3px", display: "block" }}>
            {data.totalReferred}
          </strong>
          <small style={{ fontSize: "10px", color: "#888" }}>All-time total</small>
        </div>

        <div style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(229, 107, 131, 0.2)",
          borderRadius: "10px",
          padding: "12px 10px",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "10.5px", color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
            Valid 7-Day
          </span>
          <strong style={{ fontSize: "20px", color: "#ffb3c5", fontWeight: "800", marginTop: "3px", display: "block" }}>
            {data.validReferred}
          </strong>
          <small style={{ fontSize: "10px", color: "#888" }}>Within 7 days</small>
        </div>

        <div style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(229, 107, 131, 0.2)",
          borderRadius: "10px",
          padding: "12px 10px",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "10.5px", color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
            Subscribed
          </span>
          <strong style={{ fontSize: "20px", color: "#ff9cb3", fontWeight: "800", marginTop: "3px", display: "block" }}>
            {data.subscribedReferred}
          </strong>
          <small style={{ fontSize: "10px", color: "#888" }}>Active paid</small>
        </div>

        <div style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(229, 107, 131, 0.2)",
          borderRadius: "10px",
          padding: "12px 10px",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "10.5px", color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
            Rewards Unlocked
          </span>
          <strong style={{ fontSize: "20px", color: "#4ade80", fontWeight: "800", marginTop: "3px", display: "block" }}>
            {data.rewards.length} / 3
          </strong>
          <small style={{ fontSize: "10px", color: "#888" }}>VIP Tiers</small>
        </div>
      </div>


      {/* Milestones Track */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "#dfb15b", marginBottom: "12px" }}>
          Milestone Rewards
        </h3>
        <div style={{ display: "grid", gap: "10px" }}>
          {data.milestones.map((m) => {
            const isCompleted = data.subscribedReferred >= m.required;
            return (
              <div
                key={m.milestone}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isCompleted ? "rgba(229, 107, 131, 0.12)" : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${isCompleted ? "rgba(229, 107, 131, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                  borderRadius: "10px",
                  padding: "12px 16px",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: isCompleted ? "#e56b83" : "rgba(255, 255, 255, 0.08)",
                    color: isCompleted ? "#fff" : "#999",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "13px",
                    flexShrink: 0
                  }}>
                    {isCompleted ? <Check size={16} /> : m.required}
                  </span>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "14px", display: "block" }}>
                      {m.days} Days {m.planName} Trial
                    </strong>
                    <span style={{ color: "#a88e9c", fontSize: "12px" }}>
                      Refer {m.required} {m.required === 1 ? "member" : "members"} who purchase any subscription
                    </span>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <span style={{
                      background: "rgba(74, 222, 128, 0.15)",
                      border: "1px solid rgba(74, 222, 128, 0.4)",
                      color: "#4ade80",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <Check size={12} /> Unlocked
                    </span>
                  ) : (
                    <span style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#d1b1c2",
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "999px"
                    }}>
                      {data.subscribedReferred} / {m.required}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Code & Link Box */}
      <div style={{
        background: "rgba(0, 0, 0, 0.35)",
        border: "1px dashed rgba(229, 107, 131, 0.4)",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
              Your Unique Referral Code
            </span>
            <strong style={{ fontSize: "18px", color: "#ff9cb3", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              {data.referralCode}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyCode}
            style={{
              borderColor: copiedCode ? "#4ade80" : "rgba(229, 107, 131, 0.5)",
              color: copiedCode ? "#4ade80" : "#fff",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {copiedCode ? <Check size={14} /> : <Copy size={14} />}
            {copiedCode ? "Copied" : "Copy Code"}
          </Button>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
          <Button
            className="button"
            size="sm"
            onClick={copyLink}
            style={{
              background: "linear-gradient(135deg, #e56b83 0%, #c44765 100%)",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flex: "1 1 auto"
            }}
          >
            {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
            {copiedLink ? "Link Copied!" : "Copy Invite Link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareWhatsApp}
            style={{
              borderColor: "rgba(37, 211, 102, 0.5)",
              color: "#25d366",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            Share on WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
