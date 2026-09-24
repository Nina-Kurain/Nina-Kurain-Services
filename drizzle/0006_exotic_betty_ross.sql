ALTER TABLE `posts` ADD `is_story` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `is_highlight` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `story_expires_at` integer;--> statement-breakpoint
CREATE INDEX `idx_posts_story_expiry` ON `posts` (`is_story`,`is_highlight`,`story_expires_at`);