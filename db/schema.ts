import { index, integer, sqliteTable, text, uniqueIndex,type AnySQLiteColumn } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  verified: integer("verified").notNull().default(0),
  active: integer("active").notNull().default(1),
  commentsBlocked: integer("comments_blocked").notNull().default(0),
  role: text("role", { enum: ["member", "creator", "admin"] }).notNull().default("member"),
  referralCode: text("referral_code"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [uniqueIndex("idx_users_email").on(t.email), uniqueIndex("idx_users_referral_code").on(t.referralCode)]);

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(), slug: text("slug").notNull(), name: text("name").notNull(),
  tier: integer("tier").notNull(), priceInr: integer("price_inr").notNull(),
  benefitsJson: text("benefits_json").notNull(), active: integer("active", { mode: "boolean" }).notNull().default(true),
  providerPlanId: text("provider_plan_id"), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [uniqueIndex("idx_plans_slug").on(t.slug)]);

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id),
  planId: text("plan_id").notNull(), provider: text("provider").notNull().default("razorpay"),
  providerCustomerId: text("provider_customer_id"), providerSubscriptionId: text("provider_subscription_id"),
  status: text("status").notNull().default("pending"), currentPeriodStart: integer("current_period_start", { mode: "timestamp_ms" }),
  checkoutUrl: text("checkout_url"),
  pendingPlanId: text("pending_plan_id"),
  lastEventAt: integer("last_event_at").notNull().default(0),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }), nextBillingDate: integer("next_billing_date", { mode: "timestamp_ms" }),
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).notNull().default(false),
  graceStartedAt: integer("grace_started_at", { mode: "timestamp_ms" }), graceEndsAt: integer("grace_ends_at", { mode: "timestamp_ms" }),
  lastPaymentStatus: text("last_payment_status"), lastPaymentDate: integer("last_payment_date", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [index("idx_subscriptions_user_status").on(t.userId, t.status), uniqueIndex("idx_subscriptions_provider_id").on(t.providerSubscriptionId)]);

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(), title: text("title").notNull(), caption: text("caption").notNull(),
  visibility: text("visibility").notNull().default("free"), status: text("status").notNull().default("draft"),
  accessMode: text("access_mode").notNull().default("free"),
  minimumLevel: integer("minimum_level").notNull().default(0),
  commentLevel: integer("comment_level").notNull().default(-1),
  isStory: integer("is_story").notNull().default(0),
  isHighlight: integer("is_highlight").notNull().default(0),
  storyExpiresAt: integer("story_expires_at", { mode: "timestamp_ms" }),
  previewAsset: text("preview_asset"), mediaKey: text("media_key"), mediaType: text("media_type").notNull().default("image"),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }), createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [index("idx_posts_status_published").on(t.status, t.publishedAt),index("idx_posts_story_expiry").on(t.isStory,t.isHighlight,t.storyExpiresAt)]);

export const savedPosts = sqliteTable("saved_posts", {
  userId: text("user_id").notNull().references(() => users.id), postId: text("post_id").notNull().references(() => posts.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [uniqueIndex("idx_saved_posts_user_post").on(t.userId, t.postId)]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), subscriptionId: text("subscription_id"),
  providerPaymentId: text("provider_payment_id"), amount: integer("amount").notNull(), currency: text("currency").notNull().default("INR"),
  status: text("status").notNull(), paidAt: integer("paid_at", { mode: "timestamp_ms" }), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [uniqueIndex("idx_payments_provider_id").on(t.providerPaymentId)]);

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(), provider: text("provider").notNull(), eventId: text("event_id").notNull(), eventType: text("event_type").notNull(),
  status: text("status").notNull(), error: text("error"), receivedAt: integer("received_at", { mode: "timestamp_ms" }).notNull(),
  processedAt: integer("processed_at", { mode: "timestamp_ms" }),
}, (t) => [uniqueIndex("idx_webhook_provider_event").on(t.provider, t.eventId)]);

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(), actorId: text("actor_id").notNull(), action: text("action").notNull(),
  entityType: text("entity_type").notNull(), entityId: text("entity_id"), detailJson: text("detail_json"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [index("idx_audit_actor_created").on(t.actorId, t.createdAt)]);

export const profiles = sqliteTable("profiles", { userId:text("user_id").primaryKey().references(()=>users.id), bio:text("bio").notNull().default(""), username:text("username"), avatar:text("avatar"), updatedAt:integer("updated_at").notNull() });
export const membershipPlans = sqliteTable("membership_plans", { id:text("id").primaryKey(), name:text("name").notNull(), slug:text("slug").notNull(), price:integer("price").notNull(), currency:text("currency").notNull().default("INR"), description:text("description").notNull(), benefits:text("benefits").notNull(), level:integer("level").notNull(), badge:text("badge").notNull().default(""), active:integer("active").notNull().default(1), displayOrder:integer("display_order").notNull(), providerPlanId:text("provider_plan_id"), discountEnabled:integer("discount_enabled").notNull().default(0), discountAmount:integer("discount_amount").notNull().default(0), discountLabel:text("discount_label"), discountBadge:text("discount_badge"), discountEndsAt:integer("discount_ends_at"), createdAt:integer("created_at").notNull(), updatedAt:integer("updated_at").notNull() },t=>[uniqueIndex("idx_membership_plans_slug").on(t.slug)]);
export const memberships = sqliteTable("memberships", { userId:text("user_id").primaryKey().references(()=>users.id), subscriptionId:text("subscription_id").references(()=>subscriptions.id), updatedAt:integer("updated_at").notNull() });
export const authSessions = sqliteTable("auth_sessions", { tokenHash:text("token_hash").primaryKey(), userId:text("user_id").notNull().references(()=>users.id), kind:text("kind").notNull(), expiresAt:integer("expires_at").notNull(), createdAt:integer("created_at").notNull() },t=>[index("idx_sessions_user").on(t.userId)]);
export const authTokens = sqliteTable("auth_tokens", { tokenHash:text("token_hash").primaryKey(), userId:text("user_id").notNull().references(()=>users.id), kind:text("kind").notNull(), expiresAt:integer("expires_at").notNull() });
export const authLimits = sqliteTable("auth_limits", { key:text("key").primaryKey(), count:integer("count").notNull(), expiresAt:integer("expires_at").notNull() });
export const mediaAssets = sqliteTable("media_assets", { id:text("id").primaryKey(), storageKey:text("storage_key").notNull(), name:text("name").notNull(), mime:text("mime").notNull(), bytes:integer("bytes").notNull(), createdBy:text("created_by").notNull(), createdAt:integer("created_at").notNull() });
export const postMedia = sqliteTable("post_media", { id:text("id").primaryKey(), postId:text("post_id").notNull().references(()=>posts.id), assetId:text("asset_id").notNull().references(()=>mediaAssets.id), displayOrder:integer("display_order").notNull(), cover:integer("cover").notNull().default(0) },t=>[index("idx_post_media_post").on(t.postId)]);
export const postAccess = sqliteTable("post_access", { postId:text("post_id").notNull().references(()=>posts.id), planId:text("plan_id").notNull().references(()=>membershipPlans.id) },t=>[uniqueIndex("idx_post_access_pair").on(t.postId,t.planId)]);
export const likes = sqliteTable("likes", { userId:text("user_id").notNull().references(()=>users.id), postId:text("post_id").notNull().references(()=>posts.id), createdAt:integer("created_at").notNull() },t=>[uniqueIndex("idx_likes_pair").on(t.userId,t.postId)]);
export const comments = sqliteTable("comments", { id:text("id").primaryKey(), userId:text("user_id").notNull().references(()=>users.id), postId:text("post_id").notNull().references(()=>posts.id), parentId:text("parent_id").references(():AnySQLiteColumn=>comments.id), body:text("body").notNull(), pinnedAt:integer("pinned_at"), createdAt:integer("created_at").notNull(), updatedAt:integer("updated_at").notNull(), deletedAt:integer("deleted_at") },t=>[index("idx_comments_post").on(t.postId,t.createdAt),index("idx_comments_parent").on(t.parentId,t.createdAt)]);
export const commentLikes = sqliteTable("comment_likes", { userId:text("user_id").notNull().references(()=>users.id), commentId:text("comment_id").notNull().references(()=>comments.id), createdAt:integer("created_at").notNull() },t=>[uniqueIndex("idx_comment_likes_pair").on(t.userId,t.commentId),index("idx_comment_likes_comment").on(t.commentId)]);
export const notifications = sqliteTable("notifications", { id:text("id").primaryKey(), userId:text("user_id").notNull().references(()=>users.id), title:text("title").notNull(), body:text("body").notNull(), readAt:integer("read_at"), createdAt:integer("created_at").notNull() },t=>[index("idx_notifications_user").on(t.userId,t.createdAt)]);
export const emailDeliveries = sqliteTable("email_deliveries", {
  id:text("id").primaryKey(), userId:text("user_id").references(()=>users.id), email:text("email").notNull(),
  kind:text("kind").notNull(), idempotencyKey:text("idempotency_key").notNull(), providerId:text("provider_id"),
  status:text("status").notNull().default("pending"), error:text("error"), createdAt:integer("created_at").notNull(), updatedAt:integer("updated_at").notNull(),
},t=>[uniqueIndex("idx_email_deliveries_idempotency").on(t.idempotencyKey),index("idx_email_deliveries_user_created").on(t.userId,t.createdAt),index("idx_email_deliveries_status_created").on(t.status,t.createdAt)]);
export const feedback = sqliteTable("feedback", { id:text("id").primaryKey(), userId:text("user_id").notNull().references(()=>users.id), category:text("category").notNull(), rating:integer("rating").notNull(), message:text("message").notNull(), contactOkay:integer("contact_okay").notNull().default(0), status:text("status").notNull().default("new"), createdAt:integer("created_at").notNull(), updatedAt:integer("updated_at").notNull() },t=>[index("idx_feedback_status_created").on(t.status,t.createdAt),index("idx_feedback_user_created").on(t.userId,t.createdAt)]);
export const adminActivity = sqliteTable("admin_activity", { id:text("id").primaryKey(), actorId:text("actor_id").notNull(), action:text("action").notNull(), entityId:text("entity_id"), detail:text("detail").notNull(), createdAt:integer("created_at").notNull() });
export const siteSettings = sqliteTable("site_settings", { key:text("key").primaryKey(), value:text("value").notNull() });
export const externalConnections = sqliteTable("external_connections", {
  id:text("id").primaryKey(), provider:text("provider").notNull(), accountEmail:text("account_email").notNull(),
  displayName:text("display_name").notNull().default(""), rootFolderId:text("root_folder_id").notNull(),
  encryptedRefreshToken:text("encrypted_refresh_token").notNull(), active:integer("active").notNull().default(1),
  createdBy:text("created_by").notNull(), createdAt:integer("created_at").notNull(), updatedAt:integer("updated_at").notNull(),
},t=>[uniqueIndex("idx_external_connections_provider").on(t.provider)]);
export const oauthStates = sqliteTable("oauth_states", {
  stateHash:text("state_hash").primaryKey(), provider:text("provider").notNull(), codeVerifier:text("code_verifier").notNull(),
  createdBy:text("created_by").notNull(), expiresAt:integer("expires_at").notNull(), createdAt:integer("created_at").notNull(),
},t=>[index("idx_oauth_states_expiry").on(t.expiresAt)]);

export const mediaProjects = sqliteTable("media_projects", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id),
  projectType: text("project_type").notNull(), // 'photo', 'carousel', 'reel', 'story', 'video'
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"), // 'draft', 'rendering', 'ready', 'published', 'archived'
  aspectRatio: text("aspect_ratio").notNull().default("4:5"),
  width: integer("width").notNull().default(1080),
  height: integer("height").notNull().default(1350),
  durationMs: integer("duration_ms").default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [index("idx_media_projects_owner_status").on(t.ownerId, t.status)]);

export const mediaProjectItems = sqliteTable("media_project_items", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => mediaProjects.id),
  sourceMediaId: text("source_media_id").references(() => mediaAssets.id),
  outputMediaId: text("output_media_id").references(() => mediaAssets.id),
  coverMediaId: text("cover_media_id").references(() => mediaAssets.id),
  position: integer("position").notNull().default(0),
  editRecipeJson: text("edit_recipe_json").notNull().default("{}"),
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (t) => [index("idx_media_project_items_project").on(t.projectId, t.position)]);

export const mediaExports = sqliteTable("media_exports", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => mediaProjects.id),
  mediaId: text("media_id").references(() => mediaAssets.id),
  format: text("format").notNull(),
  codec: text("codec"),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  durationMs: integer("duration_ms").default(0),
  sizeBytes: integer("size_bytes").default(0),
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed', 'cancelled'
  progress: integer("progress").notNull().default(0),
  errorCode: text("error_code"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
}, (t) => [index("idx_media_exports_project").on(t.projectId, t.status)]);

export const referrals = sqliteTable("referrals", {
  id: text("id").primaryKey(),
  referrerId: text("referrer_id").notNull().references(() => users.id),
  referredUserId: text("referred_user_id").notNull().references(() => users.id),
  referralCode: text("referral_code").notNull(),
  status: text("status").notNull().default("registered"), // 'registered' | 'converted'
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  convertedAt: integer("converted_at", { mode: "timestamp_ms" }),
}, (t) => [
  uniqueIndex("idx_referrals_referred_user").on(t.referredUserId),
  index("idx_referrals_referrer_status").on(t.referrerId, t.status)
]);

export const referralRewards = sqliteTable("referral_rewards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  milestone: integer("milestone").notNull(), // 1, 3, 5
  tierLevel: integer("tier_level").notNull(), // 1, 2, 3
  planId: text("plan_id").notNull(), // 'tier_299', 'tier_499', 'tier_649'
  days: integer("days").notNull().default(7),
  grantedAt: integer("granted_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  subscriptionId: text("subscription_id"),
}, (t) => [
  uniqueIndex("idx_referral_rewards_user_milestone").on(t.userId, t.milestone)
]);
