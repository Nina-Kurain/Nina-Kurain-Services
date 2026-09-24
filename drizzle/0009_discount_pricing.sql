ALTER TABLE `membership_plans` ADD COLUMN `discount_enabled` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `membership_plans` ADD COLUMN `discount_amount` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `membership_plans` ADD COLUMN `discount_label` text;
--> statement-breakpoint
ALTER TABLE `membership_plans` ADD COLUMN `discount_badge` text;
--> statement-breakpoint
ALTER TABLE `membership_plans` ADD COLUMN `discount_ends_at` integer;
