ALTER TABLE `users` ADD `referral_code` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_referral_code` ON `users` (`referral_code`);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` text PRIMARY KEY NOT NULL,
	`referrer_id` text NOT NULL,
	`referred_user_id` text NOT NULL,
	`referral_code` text NOT NULL,
	`status` text DEFAULT 'registered' NOT NULL,
	`created_at` integer NOT NULL,
	`converted_at` integer,
	FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`referred_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_referrals_referred_user` ON `referrals` (`referred_user_id`);
--> statement-breakpoint
CREATE INDEX `idx_referrals_referrer_status` ON `referrals` (`referrer_id`,`status`);
--> statement-breakpoint
CREATE TABLE `referral_rewards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`milestone` integer NOT NULL,
	`tier_level` integer NOT NULL,
	`plan_id` text NOT NULL,
	`days` integer DEFAULT 7 NOT NULL,
	`granted_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`subscription_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_referral_rewards_user_milestone` ON `referral_rewards` (`user_id`,`milestone`);
