-- Applied automatically on startup via spring.sql.init.schema-locations.
-- Required because spring.jpa.hibernate.ddl-auto=validate

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    provider VARCHAR(30) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GHS',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    phone_number VARCHAR(20),
    external_reference VARCHAR(100),
    authorization_url TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_reference ON payments(external_reference);
