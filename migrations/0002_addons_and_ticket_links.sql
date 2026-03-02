CREATE TABLE `addons` (
	`id` integer PRIMARY KEY NOT NULL,
	`contentfulId` text NOT NULL,
	`title` text NOT NULL,
	`price` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `addons_contentfulId_unique` ON `addons` (`contentfulId`);
--> statement-breakpoint
CREATE TABLE `ticket_addons` (
	`id` integer PRIMARY KEY NOT NULL,
	`ticket_id` integer NOT NULL,
	`addon_id` integer NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`addon_id`) REFERENCES `addons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ticket_addons_ticket_id_addon_id_unique` ON `ticket_addons` (`ticket_id`,`addon_id`);
--> statement-breakpoint
CREATE TABLE `purchase_item_addons` (
	`id` integer PRIMARY KEY NOT NULL,
	`purchase_item_id` integer NOT NULL,
	`addon_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`purchase_item_id`) REFERENCES `purchase_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`addon_id`) REFERENCES `addons`(`id`) ON UPDATE no action ON DELETE no action
);
