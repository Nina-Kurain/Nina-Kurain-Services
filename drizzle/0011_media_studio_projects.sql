CREATE TABLE `media_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`project_type` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`aspect_ratio` text DEFAULT '4:5' NOT NULL,
	`width` integer DEFAULT 1080 NOT NULL,
	`height` integer DEFAULT 1350 NOT NULL,
	`duration_ms` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_media_projects_owner_status` ON `media_projects` (`owner_id`,`status`);
--> statement-breakpoint
CREATE TABLE `media_project_items` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`source_media_id` text,
	`output_media_id` text,
	`cover_media_id` text,
	`position` integer DEFAULT 0 NOT NULL,
	`edit_recipe_json` text DEFAULT '{}' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `media_projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`output_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`cover_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_media_project_items_project` ON `media_project_items` (`project_id`,`position`);
--> statement-breakpoint
CREATE TABLE `media_exports` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`media_id` text,
	`format` text NOT NULL,
	`codec` text,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`duration_ms` integer DEFAULT 0,
	`size_bytes` integer DEFAULT 0,
	`status` text DEFAULT 'pending' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`error_code` text,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `media_projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_media_exports_project` ON `media_exports` (`project_id`,`status`);
