ALTER TABLE `customers` ADD COLUMN `emailSubscribed` integer NOT NULL DEFAULT 1;
--> statement-breakpoint
ALTER TABLE `customers` ADD COLUMN `unsubscribedAt` integer;
