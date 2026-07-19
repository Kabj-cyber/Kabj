-- Manual migration: add region to guide_profiles for region-based assignment.
-- Run against Postgres when deploying (spring.sql.init.mode=never).

ALTER TABLE guide_profiles ADD COLUMN IF NOT EXISTS region VARCHAR(50);
-- backfill existing rows manually or leave null; add NOT NULL constraint later once backfilled
