CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Clean up old tables (Order matters: drop tables with FKs first)
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS business CASCADE;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS media;

-- 2. Create Address Table (Must be first because Business links to it)
CREATE TABLE addresses (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       street VARCHAR(255) NOT NULL,
       city VARCHAR(255) NOT NULL,
       state VARCHAR(255) NOT NULL,
       zip_code VARCHAR(255) NOT NULL,
       country VARCHAR(255) NOT NULL
);

-- 3. Create Business Table
CREATE TABLE businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        company_size VARCHAR(50) NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        address_id UUID,

        CONSTRAINT fk_address
            FOREIGN KEY (address_id)
                REFERENCES addresses (id)
                ON DELETE CASCADE
);

-- 4. Create Media Table (Your new table)
CREATE TABLE media (
        media_id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255),
        media_owner_name VARCHAR(255),
        address VARCHAR(255),
        type_of_display VARCHAR(50),
        loop_duration INTEGER,
        resolution VARCHAR(50),
        aspect_ratio VARCHAR(20),
        width DOUBLE PRECISION,
        height DOUBLE PRECISION,
        price DECIMAL(10,2),
        daily_impressions INTEGER,
        schedule JSONB,
        status VARCHAR(50),
        image_file_name VARCHAR(512),
        image_content_type VARCHAR(100),
        image_data bytea
);