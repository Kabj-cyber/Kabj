-- Manual migration: guide assignment and execution tracking on bookings.
-- Run against Postgres when deploying (spring.sql.init.mode=never).

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guide_profile_id INTEGER REFERENCES guide_profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS execution_status VARCHAR(20) NOT NULL DEFAULT 'PENDING_EXECUTION';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS qr_token_issued_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
