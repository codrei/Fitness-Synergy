-- ============================================================
-- FITNESS SYNERGY DATABASE PATCH
-- Run via InfinityFree phpMyAdmin > SQL tab, in order.
-- ============================================================

USE `if0_41975335_fitnesssynergy`;

-- ============================================================
-- FIX 1: RESET ADMIN PASSWORD (already done via PHP script)
-- ============================================================


-- ============================================================
-- FIX 2: Convert MyISAM -> InnoDB
-- promos and expenses are MyISAM which has NO transaction
-- support, NO foreign keys, and table-level locking only.
-- ============================================================
ALTER TABLE `promos`   ENGINE=InnoDB;
ALTER TABLE `expenses` ENGINE=InnoDB;


-- ============================================================
-- FIX 3: Drop the dead join_date column from members
-- This column is ALWAYS NULL — no PHP code ever sets it.
-- start_date is the canonical enrollment date instead.
-- ============================================================
ALTER TABLE `members` DROP COLUMN IF EXISTS `join_date`;


-- ============================================================
-- FIX 4: Give payments.plan_id a safe DEFAULT
-- It is declared NOT NULL with no DEFAULT, so any INSERT that
-- omits it will hard-fail. Default to 1 (Walk-in/Daily) as
-- a safe fallback matching the existing walk-in logic.
-- ============================================================
ALTER TABLE `payments`
  MODIFY `plan_id` int(11) NOT NULL DEFAULT 1;


-- ============================================================
-- FIX 5: Add missing performance indexes
-- Without these, every API call does a full table scan.
-- ============================================================

ALTER TABLE `payments`
  ADD INDEX IF NOT EXISTS `idx_payment_date`      (`payment_date`),
  ADD INDEX IF NOT EXISTS `idx_customer_type`     (`customer_type`),
  ADD INDEX IF NOT EXISTS `idx_payments_member`   (`member_id`),
  ADD INDEX IF NOT EXISTS `idx_payments_plan`     (`plan_id`);

ALTER TABLE `members`
  ADD INDEX IF NOT EXISTS `idx_expiration_date`   (`expiration_date`),
  ADD INDEX IF NOT EXISTS `idx_members_plan`      (`plan_id`);

ALTER TABLE `attendance`
  ADD INDEX IF NOT EXISTS `idx_attendance_member` (`member_id`),
  ADD INDEX IF NOT EXISTS `idx_time_in`           (`time_in`);

ALTER TABLE `sessions`
  ADD INDEX IF NOT EXISTS `idx_expires_at`        (`expires_at`);


-- ============================================================
-- FIX 6: Add foreign key constraints for data integrity
-- NOTE: MariaDB does not support IF NOT EXISTS on ADD CONSTRAINT.
-- These run cleanly on a fresh database. If you get a
-- "Duplicate key name" error, the constraint already exists
-- and you can safely skip that individual statement.
-- ============================================================

-- When an admin is deleted, remove all their sessions
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_admin`
  FOREIGN KEY (`admin_id`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE;

-- When a member is deleted, cascade to attendance records
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_member`
  FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE;

-- When a member is deleted, cascade to their payment records
-- Walk-in payments (member_id=NULL) are unaffected by this FK
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_member`
  FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE;

-- Prevent deleting a plan that has active members on it
ALTER TABLE `members`
  ADD CONSTRAINT `fk_members_plan`
  FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`) ON DELETE RESTRICT;


-- ============================================================
-- FIX 7: Delete all expired sessions
-- ============================================================
DELETE FROM `sessions` WHERE `expires_at` < NOW();


-- ============================================================
-- FIX 8: Branch Sales Report Module tables
-- ============================================================

CREATE TABLE IF NOT EXISTS `monthly_targets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `month` TINYINT NOT NULL,
  `year` SMALLINT NOT NULL,
  `target_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_month_year` (`month`, `year`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `bank_deposits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `deposit_date` DATE NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `variance` DECIMAL(12,2) DEFAULT NULL,
  `remarks` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_deposit_date` (`deposit_date`)
) ENGINE=InnoDB;


-- ============================================================
-- VERIFICATION - Run these after the patch to confirm success
-- ============================================================
-- SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES
--   WHERE TABLE_SCHEMA = 'if0_41975335_fitnesssynergy';
--
-- SELECT COUNT(*) FROM sessions WHERE expires_at < NOW();  -- should be 0
--
-- SHOW INDEX FROM payments;
-- SHOW INDEX FROM members;
-- SHOW INDEX FROM attendance;
-- SHOW INDEX FROM sessions;
