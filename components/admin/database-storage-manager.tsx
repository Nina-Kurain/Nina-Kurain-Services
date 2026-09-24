"use client";

import { useState } from "react";
import { Database, Trash2, RefreshCw, Sparkles, HardDrive, CheckCircle2, AlertTriangle, Layers, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DatabaseStorageStats {
  totalBytes: number;
  freeBytes: number;
  pageCount: number;
  pageSize: number;
  freelistCount: number;
  d1LimitBytes: number;
  availableBytes: number;
  usagePercent: number;
  tables: {
    users: number;
    subscriptions: number;
    payments: number;
    media_assets: number;
    media_bytes: number;
    posts: number;
    comments: number;
    referrals: number;
    referral_rewards: number;
    admin_activity: number;
    auth_sessions: number;
    rate_limits: number;
    oauth_states: number;
    notifications: number;
  };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function DatabaseStorageManager({
  storage,
  act,
  busy,
  onRefreshed
}: {
  storage?: DatabaseStorageStats | null;
  act: (path: string, data: unknown) => Promise<boolean>;
  busy: boolean;
  onRefreshed?: () => void;
}) {
  const [cleaning, setCleaning] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  if (!storage) {
    return (
      <section className="live-panel" style={{ marginTop: 20 }}>
        <div className="settings-card-heading">
          <span className="settings-icon"><Database size={18} /></span>
          <div>
            <h2>Database Storage &amp; Capacity</h2>
            <p>Cloudflare D1 SQLite database allocation and maintenance controls.</p>
          </div>
        </div>
        <p style={{ color: "var(--ag-muted)", fontSize: 13, marginTop: 12 }}>
          Database statistics are currently loading or unavailable.
        </p>
      </section>
    );
  }

  const handleClean = async (mode: "temp" | "activity" | "notifications" | "all") => {
    if (busy || cleaning) return;
    setCleaning(mode);
    setStatusMsg("");
    try {
      const res = await fetch("/api/studio/clean-database-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode })
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message || "Cleanup failed.");
      setStatusMsg(data.message || "Storage cleaned successfully.");
      if (onRefreshed) onRefreshed();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Cleanup failed. Please retry.");
    } finally {
      setCleaning(null);
    }
  };

  const usagePercent = Math.min(100, Math.max(0.1, storage.usagePercent));
  const tempRecords = (storage.tables.auth_sessions ?? 0) + (storage.tables.rate_limits ?? 0) + (storage.tables.oauth_states ?? 0);

  return (
    <section className="live-panel" style={{
      marginTop: 20,
      background: "linear-gradient(135deg, rgba(20, 10, 18, 0.95) 0%, rgba(12, 6, 11, 0.98) 100%)",
      border: "1px solid rgba(229, 107, 131, 0.3)",
      borderRadius: 14,
      padding: 22,
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
    }}>
      <div className="settings-card-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="settings-icon" style={{
            background: "linear-gradient(135deg, #e56b83 0%, #a92f49 100%)",
            color: "#fff",
            padding: 10,
            borderRadius: 10
          }}>
            <Database size={18} />
          </span>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#fff" }}>
              Cloudflare D1 Database Storage &amp; Maintenance
            </h2>
            <p style={{ margin: "3px 0 0", color: "#a88e9c", fontSize: 13 }}>
              Live SQLite database size, storage availability, and safe one-click maintenance tools.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || Boolean(cleaning)}
          onClick={() => handleClean("all")}
          style={{
            background: "linear-gradient(135deg, #a92f49 0%, #d43b60 100%)",
            color: "#fff",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Sparkles size={14} />
          {cleaning === "all" ? "Optimizing Storage…" : "1-Click Smart Clean"}
        </Button>
      </div>

      {statusMsg && (
        <div style={{
          marginTop: 14,
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(74, 222, 128, 0.12)",
          border: "1px solid rgba(74, 222, 128, 0.3)",
          color: "#4ade80",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <CheckCircle2 size={16} /> {statusMsg}
        </div>
      )}

      {/* Storage Gauge */}
      <div style={{
        marginTop: 18,
        background: "rgba(0, 0, 0, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 10,
        padding: 16
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ fontSize: 12, color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Database Used
            </span>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginTop: 2 }}>
              {formatBytes(storage.totalBytes)} <span style={{ fontSize: 13, fontWeight: 500, color: "#a88e9c" }}>/ {formatBytes(storage.d1LimitBytes)} quota</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, color: "#a88e9c", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Free Space Available
            </span>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#4ade80", marginTop: 2 }}>
              {formatBytes(storage.availableBytes)} ({100 - usagePercent}%)
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: "100%",
          height: 8,
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: 999,
          overflow: "hidden",
          margin: "10px 0 6px"
        }}>
          <div style={{
            width: `${Math.max(2, usagePercent)}%`,
            height: "100%",
            background: usagePercent > 85 ? "#ef4444" : usagePercent > 60 ? "#f59e0b" : "linear-gradient(90deg, #e56b83 0%, #4ade80 100%)",
            borderRadius: 999,
            transition: "width 0.4s ease"
          }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#777", marginTop: 4 }}>
          <span>Page count: {storage.pageCount.toLocaleString()} ({storage.pageSize} B / page)</span>
          <span>Reclaimable freespace: {formatBytes(storage.freeBytes)}</span>
        </div>
      </div>

      {/* Table Breakdown Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
        gap: 10,
        marginTop: 14
      }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
          <span style={{ fontSize: 11, color: "#a88e9c", display: "block" }}>Media Assets</span>
          <strong style={{ fontSize: 18, color: "#fff", display: "block", marginTop: 2 }}>{storage.tables.media_assets}</strong>
          <small style={{ fontSize: 10, color: "#777" }}>{formatBytes(storage.tables.media_bytes)} total</small>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
          <span style={{ fontSize: 11, color: "#a88e9c", display: "block" }}>Members &amp; Users</span>
          <strong style={{ fontSize: 18, color: "#fff", display: "block", marginTop: 2 }}>{storage.tables.users}</strong>
          <small style={{ fontSize: 10, color: "#777" }}>{storage.tables.subscriptions} subscriptions</small>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
          <span style={{ fontSize: 11, color: "#a88e9c", display: "block" }}>Payments &amp; Refers</span>
          <strong style={{ fontSize: 18, color: "#fff", display: "block", marginTop: 2 }}>{storage.tables.payments}</strong>
          <small style={{ fontSize: 10, color: "#777" }}>{storage.tables.referrals} referrals tracked</small>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
          <span style={{ fontSize: 11, color: "#a88e9c", display: "block" }}>Posts &amp; Comments</span>
          <strong style={{ fontSize: 18, color: "#fff", display: "block", marginTop: 2 }}>{storage.tables.posts}</strong>
          <small style={{ fontSize: 10, color: "#777" }}>{storage.tables.comments} comments</small>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
          <span style={{ fontSize: 11, color: "#a88e9c", display: "block" }}>Activity Logs</span>
          <strong style={{ fontSize: 18, color: "#ff9cb3", display: "block", marginTop: 2 }}>{storage.tables.admin_activity}</strong>
          <small style={{ fontSize: 10, color: "#777" }}>Admin audit entries</small>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
          <span style={{ fontSize: 11, color: "#a88e9c", display: "block" }}>Temporary Records</span>
          <strong style={{ fontSize: 18, color: tempRecords > 50 ? "#f59e0b" : "#fff", display: "block", marginTop: 2 }}>{tempRecords}</strong>
          <small style={{ fontSize: 10, color: "#777" }}>Sessions, tokens &amp; limits</small>
        </div>
      </div>

      {/* Granular Cleanup Actions */}
      <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a88e9c", display: "block", marginBottom: 10 }}>
          Selective Storage Cleaning
        </span>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || Boolean(cleaning)}
            onClick={() => handleClean("temp")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}
          >
            <Trash2 size={13} />
            {cleaning === "temp" ? "Clearing…" : `Clear Stale Tokens (${tempRecords})`}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || Boolean(cleaning) || (storage.tables.admin_activity ?? 0) <= 150}
            onClick={() => handleClean("activity")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}
          >
            <Clock size={13} />
            {cleaning === "activity" ? "Pruning…" : "Prune Old Activity Logs"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || Boolean(cleaning) || (storage.tables.notifications ?? 0) === 0}
            onClick={() => handleClean("notifications")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}
          >
            <Layers size={13} />
            {cleaning === "notifications" ? "Pruning…" : "Prune 30+ Day Notifications"}
          </Button>
        </div>

        <small style={{ display: "block", color: "#666", fontSize: 11, marginTop: 8 }}>
          Storage cleaning safely purges expired tokens and historical logs. It never deletes active members, posts, or media files.
        </small>
      </div>
    </section>
  );
}
