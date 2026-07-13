-- Applied automatically on startup via spring.sql.init.schema-locations.
-- Required because spring.jpa.hibernate.ddl-auto=validate
-- Run this manually against Postgres if the table does not exist yet.

CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(30) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(20),
    region VARCHAR(50) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_facilities_category ON facilities(category);
CREATE INDEX IF NOT EXISTS idx_facilities_region ON facilities(region);

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Kempinski Hotel Gold Coast City', 'HOTEL', 5.570000, -0.178000,
       'Accra City Centre, Accra', '+233302610000', 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Kempinski Hotel Gold Coast City');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Golden Tulip Accra', 'HOTEL', 5.603700, -0.187000,
       'Liberation Road, Airport City, Accra', '+233302213131', 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Golden Tulip Accra');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Asantewaa Guest House', 'GUESTHOUSE', 6.688500, -1.624400,
       'Adum, Kumasi', '+233322020303', 'Ashanti'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Asantewaa Guest House');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'BridgeView Guesthouse', 'GUESTHOUSE', 5.105300, -1.246600,
       'Kotokuraba Road, Cape Coast', '+233332132456', 'Central'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'BridgeView Guesthouse');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Accra-Tema Motorway Rest Stop', 'REST_STOP', 5.620000, -0.080000,
       'Tema Motorway, Tema', NULL, 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Accra-Tema Motorway Rest Stop');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Kumasi Rest Area (Suame)', 'REST_STOP', 6.710000, -1.610000,
       'Suame Interchange, Kumasi', NULL, 'Ashanti'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Kumasi Rest Area (Suame)');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Shell Airport City', 'FUEL_STATION', 5.598000, -0.175000,
       'Airport City, Accra', '+233302777000', 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Shell Airport City');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Total Energies Adum', 'FUEL_STATION', 6.692000, -1.621000,
       'Prempeh II Street, Adum, Kumasi', '+233322023456', 'Ashanti'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Total Energies Adum');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'GridCo EV Charging Hub', 'EV_CHARGING', 5.610000, -0.190000,
       'Ridge, Accra', '+233302987654', 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'GridCo EV Charging Hub');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Solar Taxi Charging Station', 'EV_CHARGING', 6.680000, -1.630000,
       'Asokwa Industrial Area, Kumasi', '+233322098765', 'Ashanti'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Solar Taxi Charging Station');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Korle Bu Teaching Hospital', 'HOSPITAL', 5.537000, -0.228000,
       'Korle Bu, Accra', '+233302665401', 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Korle Bu Teaching Hospital');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Komfo Anokye Teaching Hospital', 'HOSPITAL', 6.695000, -1.624000,
       'Bantama, Kumasi', '+233322060602', 'Ashanti'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Komfo Anokye Teaching Hospital');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Ecobank ATM Osu', 'ATM', 5.556000, -0.175000,
       'Oxford Street, Osu, Accra', NULL, 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Ecobank ATM Osu');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'GCB ATM Cape Coast', 'ATM', 5.106000, -1.248000,
       'Kotokuraba Market, Cape Coast', NULL, 'Central'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'GCB ATM Cape Coast');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Buka Restaurant', 'RESTAURANT', 5.560000, -0.172000,
       '7th Lane, Osu, Accra', '+233302789012', 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Buka Restaurant');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Asanka Local', 'RESTAURANT', 5.605000, -0.185000,
       'Ring Road Central, Accra', '+233302456789', 'Greater Accra'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Asanka Local');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Chop Bar Kumasi', 'RESTAURANT', 6.690000, -1.622000,
       'Kejetia Market, Kumasi', '+233322011223', 'Ashanti'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Chop Bar Kumasi');

INSERT INTO facilities (name, category, latitude, longitude, address, phone_number, region)
SELECT 'Cape Coast Castle Café', 'RESTAURANT', 5.103000, -1.240000,
       'Cape Coast Castle, Cape Coast', '+233332145678', 'Central'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Cape Coast Castle Café');
