ALTER TABLE `comments` ADD `parent_id` text REFERENCES comments(id);--> statement-breakpoint
CREATE INDEX `idx_comments_parent` ON `comments` (`parent_id`,`created_at`);