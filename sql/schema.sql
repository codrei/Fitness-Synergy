-- Fitness Synergy: table structure only (no data), extracted from a local backup.
-- Load this, then sql/database_patch.sql, then sql/demo_seed.sql for the public demo.

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) DEFAULT NULL,
  `admin_username` varchar(50) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` varchar(50) DEFAULT NULL,
  `summary` varchar(500) NOT NULL,
  `payload` longtext DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `attendance` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) DEFAULT NULL,
  `time_in` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bank_deposits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deposit_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `variance` decimal(12,2) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `contract_counter` (
  `id` tinyint(4) NOT NULL DEFAULT 1,
  `last_seq` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `expenses` (
  `expense_id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `expense_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`expense_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `attempted_at` timestamp NULL DEFAULT current_timestamp(),
  `success` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `members` (
  `member_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(50) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` tinyint(3) UNSIGNED DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_number` varchar(20) DEFAULT NULL,
  `contract_id` varchar(50) DEFAULT NULL,
  `discount_type` enum('None','Student','Senior') DEFAULT 'None',
  `discount_id` varchar(50) DEFAULT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `discount_id_type` varchar(50) DEFAULT NULL,
  `discount_school_name` varchar(100) DEFAULT NULL,
  `is_installment` tinyint(1) DEFAULT 0,
  `installment_total` decimal(10,2) DEFAULT 0.00,
  `renewal_contacted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `monthly_targets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `month` tinyint(4) NOT NULL,
  `year` smallint(6) NOT NULL,
  `target_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `plan_id` int(11) NOT NULL DEFAULT 1,
  `customer_type` enum('Member','Walk-in') DEFAULT 'Member',
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_age` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `guest_contact` varchar(20) DEFAULT NULL,
  `guest_address` varchar(255) DEFAULT NULL,
  `bonus_days` int(11) NOT NULL DEFAULT 0,
  `walkin_key` varchar(64) GENERATED ALWAYS AS (case when `customer_type` = 'Walk-in' then coalesce(`guest_contact`,concat('name:',lcase(`guest_name`))) else NULL end) STORED,
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `plans` (
  `plan_id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_days` int(11) DEFAULT 0,
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `promos` (
  `promo_id` int(11) NOT NULL AUTO_INCREMENT,
  `promo_name` varchar(100) NOT NULL,
  `bonus_days` int(11) NOT NULL DEFAULT 0,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_free` tinyint(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`promo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_token` varchar(64) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `activity_log`
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_admin` (`admin_id`,`created_at`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_action` (`action`,`created_at`);
ALTER TABLE `admins`
  ADD UNIQUE KEY `username` (`username`);
ALTER TABLE `attendance`
  ADD KEY `idx_attendance_member` (`member_id`),
  ADD KEY `idx_time_in` (`time_in`);
ALTER TABLE `bank_deposits`
  ADD KEY `idx_deposit_date` (`deposit_date`);

ALTER TABLE `login_attempts`
  ADD KEY `idx_ip_time` (`ip_address`,`attempted_at`);
ALTER TABLE `members`
  ADD UNIQUE KEY `contract_id` (`contract_id`),
  ADD KEY `idx_expiration_date` (`expiration_date`),
  ADD KEY `idx_members_plan` (`plan_id`),
  ADD KEY `idx_expiration_contacted` (`expiration_date`,`renewal_contacted_at`);
ALTER TABLE `monthly_targets`
  ADD UNIQUE KEY `uk_month_year` (`month`,`year`);
ALTER TABLE `payments`
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_customer_type` (`customer_type`),
  ADD KEY `idx_payments_member` (`member_id`),
  ADD KEY `idx_payments_plan` (`plan_id`),
  ADD KEY `idx_walkin_key` (`walkin_key`);

ALTER TABLE `sessions`
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `session_token_2` (`session_token`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `fk_sessions_admin` (`admin_id`);
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE;
ALTER TABLE `members`
  ADD CONSTRAINT `fk_members_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`);
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE;
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE;
-- Key/value settings (e.g. weekly_target). Values are JSON.
CREATE TABLE IF NOT EXISTS `settings` (
  `k` varchar(64) NOT NULL PRIMARY KEY,
  `v` text NOT NULL
);
