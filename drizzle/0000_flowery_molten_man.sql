CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_login_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE TABLE `agent_customer_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`assigned_at` text NOT NULL,
	`assigned_by` text
);
--> statement-breakpoint
CREATE INDEX `aca_agent_idx` ON `agent_customer_assignments` (`agent_id`);--> statement-breakpoint
CREATE INDEX `aca_cust_idx` ON `agent_customer_assignments` (`customer_id`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`name` text NOT NULL,
	`mobile` text NOT NULL,
	`email` text,
	`password_hash` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agents_agent_id_unique` ON `agents` (`agent_id`);--> statement-breakpoint
CREATE INDEX `agents_mobile_idx` ON `agents` (`mobile`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text,
	`details` text,
	`ip` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`amount` real NOT NULL,
	`payment_mode` text DEFAULT 'cash' NOT NULL,
	`transaction_ref` text,
	`remarks` text,
	`collected_by_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_collection_id_unique` ON `collections` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collections_cust_idx` ON `collections` (`customer_id`);--> statement-breakpoint
CREATE INDEX `collections_agent_idx` ON `collections` (`agent_id`);--> statement-breakpoint
CREATE INDEX `collections_date_idx` ON `collections` (`date`);--> statement-breakpoint
CREATE TABLE `customer_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`doc_type` text NOT NULL,
	`file_name` text,
	`file_url` text,
	`uploaded_by_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cd_cust_idx` ON `customer_documents` (`customer_id`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`name` text NOT NULL,
	`father_husband_name` text,
	`dob` text,
	`gender` text,
	`aadhaar_enc` text,
	`aadhaar_mask` text,
	`mobile` text,
	`alternate_mobile` text,
	`full_address` text,
	`village` text,
	`post` text,
	`tehsil` text,
	`district` text,
	`state` text,
	`pin` text,
	`registration_date` text,
	`assigned_agent_id` text,
	`daily_collection_amount` real DEFAULT 0 NOT NULL,
	`collection_frequency` text DEFAULT 'daily' NOT NULL,
	`plan_type` text DEFAULT 'basic' NOT NULL,
	`total_deposited` real DEFAULT 0 NOT NULL,
	`total_pending` real DEFAULT 0 NOT NULL,
	`account_status` text DEFAULT 'active' NOT NULL,
	`password_hash` text,
	`login_enabled` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_customer_id_unique` ON `customers` (`customer_id`);--> statement-breakpoint
CREATE INDEX `customers_agent_idx` ON `customers` (`assigned_agent_id`);--> statement-breakpoint
CREATE INDEX `customers_status_idx` ON `customers` (`account_status`);--> statement-breakpoint
CREATE INDEX `customers_mobile_idx` ON `customers` (`mobile`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`channel` text NOT NULL,
	`recipient_type` text NOT NULL,
	`recipient_id` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`collection_id` text,
	`customer_id` text NOT NULL,
	`agent_id` text,
	`date` text NOT NULL,
	`amount` real NOT NULL,
	`payment_mode` text DEFAULT 'cash' NOT NULL,
	`transaction_ref` text,
	`type` text DEFAULT 'collection' NOT NULL,
	`status` text DEFAULT 'success' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_transactions_transaction_id_unique` ON `payment_transactions` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `pt_cust_idx` ON `payment_transactions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `pt_date_idx` ON `payment_transactions` (`date`);--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt_number` text NOT NULL,
	`collection_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`amount` real NOT NULL,
	`previous_balance` real NOT NULL,
	`current_balance` real NOT NULL,
	`generated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receipts_receipt_number_unique` ON `receipts` (`receipt_number`);--> statement-breakpoint
CREATE INDEX `receipts_coll_idx` ON `receipts` (`collection_id`);--> statement-breakpoint
CREATE INDEX `receipts_cust_idx` ON `receipts` (`customer_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);