-- Manual migration: add payout MoMo details to guide_profiles for scan-completion transfers.
-- Run against Postgres when deploying (spring.sql.init.mode=never).

ALTER TABLE guide_profiles ADD COLUMN IF NOT EXISTS payout_momo_number VARCHAR(20);
ALTER TABLE guide_profiles ADD COLUMN IF NOT EXISTS payout_telco VARCHAR(10);
