CREATE TABLE `comment_likes` (
	`user_id` text NOT NULL,
	`comment_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_comment_likes_pair` ON `comment_likes` (`user_id`,`comment_id`);--> statement-breakpoint
CREATE INDEX `idx_comment_likes_comment` ON `comment_likes` (`comment_id`);--> statement-breakpoint
ALTER TABLE `comments` ADD `pinned_at` integer;