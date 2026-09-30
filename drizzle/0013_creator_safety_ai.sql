ALTER TABLE `media_assets` ADD `moderation_status` text DEFAULT 'quarantined' NOT NULL;
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `moderation_reason` text;
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `reviewed_by` text;
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `reviewed_at` integer;
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `content_origin` text DEFAULT 'user_upload' NOT NULL;
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `ai_label` text;
--> statement-breakpoint
UPDATE `media_assets` SET `moderation_status` = 'approved', `moderation_reason` = 'Legacy administrator content predates the safety queue.' WHERE `moderation_status` = 'quarantined';
--> statement-breakpoint
CREATE TABLE `legal_acceptances` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL, `document_type` text NOT NULL, `document_version` text NOT NULL, `purpose` text NOT NULL, `accepted_at` integer NOT NULL, `ip_hash` text, FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade);
--> statement-breakpoint
CREATE INDEX `idx_legal_acceptances_user_created` ON `legal_acceptances` (`user_id`,`accepted_at`);
--> statement-breakpoint
CREATE TABLE `creator_applications` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL, `status` text DEFAULT 'payment_pending' NOT NULL, `fee_amount` integer DEFAULT 25000 NOT NULL, `currency` text DEFAULT 'INR' NOT NULL, `provider_payment_id` text, `submitted_at` integer NOT NULL, `approved_at` integer, `updated_at` integer NOT NULL, FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_creator_applications_user` ON `creator_applications` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_creator_applications_status` ON `creator_applications` (`status`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `ai_wallets` (`user_id` text PRIMARY KEY NOT NULL, `balance` integer DEFAULT 0 NOT NULL, `lifetime_purchased` integer DEFAULT 0 NOT NULL, `updated_at` integer NOT NULL, FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade);
--> statement-breakpoint
CREATE TABLE `ai_transactions` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL, `kind` text NOT NULL, `provider` text NOT NULL, `units` integer NOT NULL, `amount` integer DEFAULT 0 NOT NULL, `currency` text DEFAULT 'INR' NOT NULL, `provider_reference` text, `status` text DEFAULT 'pending' NOT NULL, `created_at` integer NOT NULL, `updated_at` integer NOT NULL, FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade);
--> statement-breakpoint
CREATE INDEX `idx_ai_transactions_user_created` ON `ai_transactions` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_ai_transactions_provider_reference` ON `ai_transactions` (`provider_reference`);
--> statement-breakpoint
CREATE TABLE `moderation_reports` (`id` text PRIMARY KEY NOT NULL, `reference_code` text NOT NULL, `reporter_user_id` text, `category` text NOT NULL, `full_name` text NOT NULL, `email` text NOT NULL, `relationship` text NOT NULL, `content_urls` text NOT NULL, `description` text DEFAULT '' NOT NULL, `signature` text NOT NULL, `status` text DEFAULT 'received' NOT NULL, `priority` text DEFAULT 'normal' NOT NULL, `confirmed` integer DEFAULT 0 NOT NULL, `created_at` integer NOT NULL, `updated_at` integer NOT NULL, FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_moderation_reports_reference` ON `moderation_reports` (`reference_code`);
--> statement-breakpoint
CREATE INDEX `idx_moderation_reports_status` ON `moderation_reports` (`status`,`created_at`);
--> statement-breakpoint
CREATE TABLE `creator_earnings` (`id` text PRIMARY KEY NOT NULL, `creator_id` text NOT NULL, `payer_id` text, `reference_id` text, `gross_amount` integer NOT NULL, `platform_fee` integer NOT NULL, `net_amount` integer NOT NULL, `currency` text DEFAULT 'INR' NOT NULL, `status` text DEFAULT 'pending_settlement' NOT NULL, `available_at` integer NOT NULL, `paid_at` integer, `created_at` integer NOT NULL, FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (`payer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null);
--> statement-breakpoint
CREATE INDEX `idx_creator_earnings_creator_status` ON `creator_earnings` (`creator_id`,`status`,`created_at`);
