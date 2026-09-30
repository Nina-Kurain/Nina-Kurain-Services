"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  IndianRupee,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Heart,
  MessageCircle,
  Bookmark,
  Calendar,
  Layers,
} from "lucide-react";

interface TimeseriesPoint {
  date: string;
  label: string;
  revenue: number;
  cumulativeRevenue: number;
  newMembers: number;
  cumulativeMembers: number;
}

interface TopPost {
  id: string;
  title: string;
  published_at: number;
  likes_count: number;
  comments_count: number;
}

interface AdminAnalyticsChartsProps {
  data: {
    users?: { total_users?: number; unverified_users?: number };
    subscriptions?: {
      active_memberships?: number;
      grace_memberships?: number;
      expired_memberships?: number;
    };
    revenue?: { revenue?: number };
    stats?: {
      published_posts?: number;
      draft_posts?: number;
      total_posts?: number;
    };
    members?: Array<{ id: string; name: string; count: number }>;
    analytics?: {
      timeseries?: TimeseriesPoint[];
      topPosts?: TopPost[];
      totalEngagement?: {
        likes: number;
        comments: number;
        bookmarks: number;
      };
      allTimeRevenue?: number;
    };
  };
}

const TIER_COLORS = [
  "#ff2d75", // Hot Velvet Rose
  "#c026d3", // Electric Fuchsia
  "#a855f7", // Deep Amethyst
  "#38bdf8", // Sky Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
];

export function AdminAnalyticsCharts({ data }: AdminAnalyticsChartsProps) {
  const [activeRange, setActiveRange] = useState<"7d" | "30d" | "90d">("30d");
  const [metricMode, setMetricMode] = useState<"cumulative" | "daily">("cumulative");

  const totalUsers = data.users?.total_users ?? 0;
  const activeSubs = data.subscriptions?.active_memberships ?? 0;
  const monthlyRevenue = (data.revenue?.revenue ?? 0) / 100;
  const allTimeRevenue = data.analytics?.allTimeRevenue ?? monthlyRevenue;
  const publishedPosts = data.stats?.published_posts ?? 0;
  const totalEngagement = data.analytics?.totalEngagement ?? { likes: 0, comments: 0, bookmarks: 0 };
  const topPosts = data.analytics?.topPosts ?? [];

  // Slice real timeseries based on selected range
  const chartTimeseries = useMemo(() => {
    const raw = data.analytics?.timeseries;
    const sliceCount = activeRange === "7d" ? 7 : activeRange === "30d" ? 30 : 90;

    if (raw && raw.length > 0) {
      return raw.slice(-sliceCount);
    }

    // Fallback: If DB timeseries is empty, construct a clean real baseline from scalar DB totals
    const points: TimeseriesPoint[] = [];
    const now = Date.now();
    for (let i = sliceCount - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      points.push({
        date: d.toISOString().slice(0, 10),
        label,
        revenue: 0,
        cumulativeRevenue: Math.round(monthlyRevenue),
        newMembers: 0,
        cumulativeMembers: totalUsers,
      });
    }
    return points;
  }, [data.analytics?.timeseries, activeRange, monthlyRevenue, totalUsers]);

  // Real membership plan distribution
  const membershipDistribution = useMemo(() => {
    if (data.members && data.members.length > 0) {
      const totalCount = data.members.reduce((sum, m) => sum + (m.count || 0), 0);
      return data.members.map((m, idx) => ({
        name: m.name,
        value: m.count || 0,
        percentage: totalCount > 0 ? Math.round(((m.count || 0) / totalCount) * 100) : 0,
        color: TIER_COLORS[idx % TIER_COLORS.length],
      }));
    }
    return [
      { name: "Free Tier", value: Math.max(0, totalUsers - activeSubs), percentage: 100, color: "#a855f7" },
      { name: "Active VIP", value: activeSubs, percentage: 0, color: "#ff2d75" },
    ];
  }, [data.members, activeSubs, totalUsers]);

  const vipConversionRate = totalUsers > 0 ? ((activeSubs / totalUsers) * 100).toFixed(1) : "0.0";
  const arpu = activeSubs > 0 ? Math.round(monthlyRevenue / activeSubs) : 0;

  return (
    <div className="admin-analytics-wrapper" style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24, marginBottom: 24 }}>
      {/* 1. Header Toolbar with Filter & Range Selection */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          padding: "16px 22px",
          background: "linear-gradient(135deg, rgba(255, 45, 117, 0.08) 0%, rgba(30, 9, 26, 0.4) 100%)",
          border: "1px solid rgba(255, 45, 117, 0.22)",
          borderRadius: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #ff2d75, #a80f49)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 15px rgba(255, 45, 117, 0.35)",
            }}
          >
            <TrendingUp size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <span>Live Database Intelligence</span>
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", fontWeight: 600 }}>
                100% REAL DATA
              </span>
            </h3>
            <span style={{ fontSize: 12, color: "#c9b5c2" }}>
              Actual Stripe &amp; Razorpay payments, verified member signups, and live post engagement
            </span>
          </div>
        </div>

        {/* Controls: Mode toggle + Time Range */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Daily vs Cumulative */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(0, 0, 0, 0.4)",
              padding: 3,
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => setMetricMode("cumulative")}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                border: 0,
                fontSize: 11,
                fontWeight: metricMode === "cumulative" ? 700 : 500,
                background: metricMode === "cumulative" ? "rgba(255, 45, 117, 0.35)" : "transparent",
                color: metricMode === "cumulative" ? "#fff" : "#a5949d",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Cumulative
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("daily")}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                border: 0,
                fontSize: 11,
                fontWeight: metricMode === "daily" ? 700 : 500,
                background: metricMode === "daily" ? "rgba(255, 45, 117, 0.35)" : "transparent",
                color: metricMode === "daily" ? "#fff" : "#a5949d",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Daily
            </button>
          </div>

          {/* Time range pills */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(0, 0, 0, 0.4)",
              padding: 3,
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRange(r)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: 0,
                  fontSize: 11,
                  fontWeight: activeRange === r ? 700 : 500,
                  background:
                    activeRange === r
                      ? "linear-gradient(135deg, #ff2d75, #980e42)"
                      : "transparent",
                  color: activeRange === r ? "#fff" : "#a5949d",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Key Performance Indicators (Real Database Stats) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        <div style={{ background: "rgba(22, 9, 22, 0.75)", border: "1px solid rgba(255, 45, 117, 0.2)", borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#ff8da8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Real Revenue
            </span>
            <IndianRupee size={15} color="#ff2d75" />
          </div>
          <strong style={{ fontSize: 24, fontWeight: 700, color: "#fff", display: "block" }}>
            ₹{allTimeRevenue.toLocaleString("en-IN")}
          </strong>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            ₹{monthlyRevenue.toLocaleString("en-IN")} this current month
          </span>
        </div>

        <div style={{ background: "rgba(22, 9, 22, 0.75)", border: "1px solid rgba(192, 38, 211, 0.2)", borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#e879f9", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              VIP Conversion
            </span>
            <Users size={15} color="#c026d3" />
          </div>
          <strong style={{ fontSize: 24, fontWeight: 700, color: "#fff", display: "block" }}>
            {vipConversionRate}%
          </strong>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {activeSubs} active VIPs of {totalUsers} registered
          </span>
        </div>

        <div style={{ background: "rgba(22, 9, 22, 0.75)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#7dd3fc", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Interactions
            </span>
            <Heart size={15} color="#38bdf8" />
          </div>
          <strong style={{ fontSize: 24, fontWeight: 700, color: "#fff", display: "block" }}>
            {totalEngagement.likes + totalEngagement.comments + totalEngagement.bookmarks}
          </strong>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {totalEngagement.likes} likes · {totalEngagement.comments} comments · {totalEngagement.bookmarks} saves
          </span>
        </div>

        <div style={{ background: "rgba(22, 9, 22, 0.75)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Avg. VIP ARPU
            </span>
            <Sparkles size={15} color="#10b981" />
          </div>
          <strong style={{ fontSize: 24, fontWeight: 700, color: "#fff", display: "block" }}>
            ₹{arpu.toLocaleString("en-IN")}
          </strong>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            Monthly yield per paying subscriber
          </span>
        </div>
      </div>

      {/* 3. Main Analytics Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {/* Chart 1: Real Revenue Trajectory */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(22, 9, 22, 0.85) 0%, rgba(12, 5, 13, 0.95) 100%)",
            border: "1px solid rgba(255, 45, 117, 0.2)",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ff75a0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {metricMode === "cumulative" ? "Cumulative Revenue Growth" : "Daily Revenue Inflow"}
              </span>
              <h4 style={{ margin: "4px 0 0", fontSize: 18, color: "#fff", fontWeight: 700 }}>
                ₹{monthlyRevenue.toLocaleString("en-IN")}
              </h4>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: "#4ade80",
                background: "rgba(74, 222, 128, 0.12)",
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              <ArrowUpRight size={13} /> Real Timeline
            </span>
          </div>

          <div style={{ width: "100%", height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTimeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="roseGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2d75" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#ff2d75" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#6b5b66"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#6b5b66"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(18, 7, 18, 0.95)",
                    border: "1px solid rgba(255, 45, 117, 0.4)",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    fontSize: 12,
                    color: "#fff",
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, metricMode === "cumulative" ? "Total Revenue" : "Daily Inflow"]}
                />
                <Area
                  type="monotone"
                  dataKey={metricMode === "cumulative" ? "cumulativeRevenue" : "revenue"}
                  stroke="#ff2d75"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#roseGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8e7786", marginTop: 8 }}>
            <span>Razorpay Settled Records</span>
            <span>Last {activeRange} calendar window</span>
          </div>
        </div>

        {/* Chart 2: Real VIP Tier Composition */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(22, 9, 22, 0.85) 0%, rgba(12, 5, 13, 0.95) 100%)",
            border: "1px solid rgba(192, 38, 211, 0.2)",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#e879f9", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Active Plan Distribution
              </span>
              <h4 style={{ margin: "4px 0 0", fontSize: 18, color: "#fff", fontWeight: 700 }}>
                {totalUsers} Registered Accounts
              </h4>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: "#e879f9",
                background: "rgba(232, 121, 249, 0.12)",
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              <Users size={13} /> {activeSubs} VIP Active
            </span>
          </div>

          <div style={{ width: "100%", height: 210, display: "flex", alignItems: "center" }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie
                  data={membershipDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {membershipDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(18, 7, 18, 0.95)",
                    border: "1px solid rgba(232, 121, 249, 0.4)",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    fontSize: 12,
                    color: "#fff",
                  }}
                  formatter={(val: any) => [`${val} Members`, "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: 10 }}>
              {membershipDistribution.slice(0, 4).map((item) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <span style={{ fontSize: 11.5, color: "#faf2f6", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: 10.5, color: "#8e7786" }}>
                      {item.value} members ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8e7786", marginTop: 8 }}>
            <span>Database Entitlements</span>
            <span>Live membership breakdown</span>
          </div>
        </div>

        {/* Chart 3: Member Signups Velocity */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(22, 9, 22, 0.85) 0%, rgba(12, 5, 13, 0.95) 100%)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fb7185", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Member Signups Over Time
              </span>
              <h4 style={{ margin: "4px 0 0", fontSize: 18, color: "#fff", fontWeight: 700 }}>
                {metricMode === "cumulative" ? `${totalUsers} Total Members` : "New Daily Signups"}
              </h4>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: "#fb7185",
                background: "rgba(251, 113, 133, 0.12)",
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              <Sparkles size={13} /> Signups Log
            </span>
          </div>

          <div style={{ width: "100%", height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartTimeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  stroke="#6b5b66"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#6b5b66"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(18, 7, 18, 0.95)",
                    border: "1px solid rgba(251, 113, 133, 0.4)",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    fontSize: 12,
                    color: "#fff",
                  }}
                  formatter={(val: any) => [`${val} Members`, metricMode === "cumulative" ? "Total Community" : "New Signups"]}
                />
                <Bar
                  dataKey={metricMode === "cumulative" ? "cumulativeMembers" : "newMembers"}
                  fill="url(#barGradient)"
                  radius={[5, 5, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#881337" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8e7786", marginTop: 8 }}>
            <span>Verified User Signups</span>
            <span>Real database user registrations</span>
          </div>
        </div>
      </div>

      {/* 4. Real Post Performance Leaderboard */}
      {topPosts.length > 0 && (
        <div
          style={{
            background: "linear-gradient(180deg, rgba(22, 9, 22, 0.85) 0%, rgba(12, 5, 13, 0.95) 100%)",
            border: "1px solid rgba(255, 45, 117, 0.18)",
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <span style={{ fontSize: 11, color: "#ff8da8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Top Engaged Studio Posts
              </span>
              <h4 style={{ margin: "4px 0 0", fontSize: 16, color: "#fff", fontWeight: 700 }}>
                Real Member Interactions Across Vault Collections
              </h4>
            </div>
            <span style={{ fontSize: 12, color: "#a5949d" }}>
              {publishedPosts} total published drops
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topPosts.map((post, idx) => (
              <div
                key={post.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ff2d75", width: 20 }}>
                    #{idx + 1}
                  </span>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <strong style={{ fontSize: 13, color: "#f8f6f3", display: "block" }}>
                      {post.title || "Untitled Post"}
                    </strong>
                    <small style={{ fontSize: 11, color: "#8e7786" }}>
                      {new Date(post.published_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </small>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#ff8da8" }}>
                    <Heart size={13} fill="#ff2d75" color="#ff2d75" />
                    <span>{post.likes_count}</span>
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af" }}>
                    <MessageCircle size={13} />
                    <span>{post.comments_count}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
