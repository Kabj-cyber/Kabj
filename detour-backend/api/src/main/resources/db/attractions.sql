-- Applied automatically on startup via spring.sql.init.schema-locations.
-- Required because spring.jpa.hibernate.ddl-auto=validate

ALTER TABLE attractions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2);
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS review_count INTEGER;

CREATE TABLE IF NOT EXISTS attraction_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    attraction_id INTEGER NOT NULL REFERENCES attractions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, attraction_id)
);

CREATE INDEX IF NOT EXISTS idx_attraction_favorites_user_id ON attraction_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_attraction_favorites_attraction_id ON attraction_favorites(attraction_id);
