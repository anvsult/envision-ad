CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Clean up old tables (Order matters: drop tables with FKs first)
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS media_location;
DROP TABLE IF EXISTS business CASCADE;
DROP TABLE IF EXISTS address;


-- 2. Create Address Table (Must be first because Business links to it)
CREATE TABLE address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL
);

-- 3. Create Business Table
CREATE TABLE business (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company_size VARCHAR(50) NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address_id UUID,

    CONSTRAINT fk_address
        FOREIGN KEY (address_id)
            REFERENCES address (id)
            ON DELETE CASCADE
);

-- 4. Create Media Location Table
CREATE TABLE media_location (
    media_location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    country VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

-- 4. Create Media Table
CREATE TABLE media (
    media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_location_id UUID NOT NULL
        REFERENCES media_location(media_location_id)
        ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    media_owner_name VARCHAR(255) NOT NULL,
    type_of_display VARCHAR(50) NOT NULL,
    loop_duration INTEGER,
    resolution VARCHAR(50),
    aspect_ratio VARCHAR(20),
    width DOUBLE PRECISION,
    height DOUBLE PRECISION,
    price DECIMAL(10, 2),
    daily_impressions INTEGER,
    schedule JSONB,
    status VARCHAR(50) NOT NULL,
    image_file_name VARCHAR(512),
    image_content_type VARCHAR(100),
    image_data BYTEA
);
