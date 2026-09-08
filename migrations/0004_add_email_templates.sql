CREATE TABLE `email_templates` (
	`id` integer PRIMARY KEY NOT NULL,
	`templateKey` text NOT NULL,
	`event_id` integer,
	`subject` text NOT NULL,
	`bodyHtml` text NOT NULL,
	`signOff` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_templates_global_key_idx` ON `email_templates` (`templateKey`) WHERE "email_templates"."event_id" is null;
--> statement-breakpoint
CREATE UNIQUE INDEX `email_templates_event_key_idx` ON `email_templates` (`templateKey`,`event_id`) WHERE "email_templates"."event_id" is not null;
