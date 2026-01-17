CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 1. Clean up old tables (Order matters: drop tables with FKs first)
DROP TABLE IF EXISTS reservations CASCADE;
-- Drop tables that have foreign keys to `media` first, then `media` itself.
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS media_location CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS business_roles CASCADE;
DROP TABLE IF EXISTS business CASCADE;
DROP TABLE IF EXISTS address CASCADE;
DROP TABLE IF EXISTS ad_campaigns CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS invitation CASCADE;


-- 2. Create Address Table (Must be first because Business links to it)
CREATE TABLE address
(
    id       SERIAL PRIMARY KEY,
    street   VARCHAR(255) NOT NULL,
    city     VARCHAR(255) NOT NULL,
    state    VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    country  VARCHAR(255) NOT NULL
);

-- 3. Create Business Table
CREATE TABLE business
(
    id           SERIAL PRIMARY KEY,
    business_id  varchar(36) UNIQUE NOT NULL,
    name         VARCHAR(255)       NOT NULL,
    organization_size VARCHAR(50)        NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address_id   INTEGER,
    owner_id     VARCHAR(36),
    media_owner  BOOLEAN,
    advertiser   BOOLEAN,

    CONSTRAINT fk_address
        FOREIGN KEY (address_id)
            REFERENCES address (id)
            ON DELETE CASCADE
);

CREATE TABLE employee
(
    id          SERIAL PRIMARY KEY,
    employee_id VARCHAR(36) UNIQUE NOT NULL,
    user_id     VARCHAR(36) UNIQUE NOT NULL,
    business_id VARCHAR(36)  NOT NULL,

    CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES business (business_id) ON DELETE CASCADE
);

CREATE TABLE invitation
(
    id            SERIAL PRIMARY KEY,
    invitation_id VARCHAR(36)  UNIQUE NOT NULL,
    business_id   VARCHAR(36)  NOT NULL,
    email         VARCHAR(255) NOT NULL,
    token         VARCHAR(100) NOT NULL,
    time_created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_expires   TIMESTAMP,

    CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES business (business_id) ON DELETE CASCADE
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

-- 5. Create Media Table
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
    image_url VARCHAR(512),
    image_file_name VARCHAR(512),
    image_content_type VARCHAR(100),
    image_data         bytea
);

-- 5. Create Ad Campaigns Table
CREATE TABLE ad_campaigns
(
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);
-- 6. Create Ads Table
CREATE TABLE ads
(
    id SERIAL PRIMARY KEY,
    ad_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    ad_url VARCHAR(512) NOT NULL,
    ad_duration_seconds INTEGER NOT NULL,
    ad_type VARCHAR(50) NOT NULL,

    ad_campaign_ref_id INTEGER REFERENCES ad_campaigns(id) ON DELETE CASCADE
);

CREATE TABLE reservations
(
    id SERIAL PRIMARY KEY,
    reservation_id VARCHAR(36) UNIQUE NOT NULL,

    start_date TIMESTAMP,
    end_date TIMESTAMP,

    status VARCHAR(50) NOT NULL,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    advertiser_id VARCHAR(36),
    campaign_id VARCHAR(36) REFERENCES ad_campaigns(campaign_id) ON DELETE SET NULL,
    media_id UUID REFERENCES media(media_id) ON DELETE CASCADE

);