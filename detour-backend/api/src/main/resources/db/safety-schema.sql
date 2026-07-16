-- Safety alerts feature has been removed from the app; drop the old table if present.
DROP TABLE IF EXISTS safety_alerts;

CREATE TABLE IF NOT EXISTS verified_guides (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    region VARCHAR(50) NOT NULL,
    transport_type VARCHAR(50) NOT NULL,
    license_number VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 4.50,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS safety_incidents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    region VARCHAR(50),
    audio_path VARCHAR(500),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    notes TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sample verified transport guides
INSERT INTO verified_guides (name, phone_number, region, transport_type, license_number, rating)
SELECT 'Kwame Mensah', '+233241234567', 'Greater Accra', 'Private car', 'GTA-ACC-001', 4.90
WHERE NOT EXISTS (SELECT 1 FROM verified_guides LIMIT 1);

INSERT INTO verified_guides (name, phone_number, region, transport_type, license_number, rating)
SELECT 'Ama Boateng', '+233209876543', 'Central', 'Minibus (Trotro)', 'GTA-CEN-014', 4.75
WHERE (SELECT COUNT(*) FROM verified_guides) < 2;

INSERT INTO verified_guides (name, phone_number, region, transport_type, license_number, rating)
SELECT 'Kofi Asante', '+233551112233', 'Ashanti', 'SUV / 4x4', 'GTA-ASH-007', 4.85
WHERE (SELECT COUNT(*) FROM verified_guides) < 3;