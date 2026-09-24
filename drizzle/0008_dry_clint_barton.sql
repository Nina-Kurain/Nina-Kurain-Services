CREATE TABLE `email_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`kind` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`provider_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_email_deliveries_idempotency` ON `email_deliveries` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_email_deliveries_user_created` ON `email_deliveries` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_email_deliveries_status_created` ON `email_deliveries` (`status`,`created_at`);