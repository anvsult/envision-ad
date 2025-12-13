CREATE
EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Clean up old tables (Order matters: drop tables with FKs first)
DROP TABLE IF EXISTS business_employees CASCADE;
DROP TABLE IF EXISTS business_roles CASCADE;
DROP TABLE IF EXISTS business CASCADE;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS ad_campaigns CASCADE;
DROP TABLE IF EXISTS ads CASCADE;

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
    company_size VARCHAR(50)        NOT NULL,
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

CREATE TABLE business_employees
(
    business_id INTEGER            NOT NULL,
    employee_id VARCHAR(36) UNIQUE NOT NULL,

    CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES business (id) ON DELETE CASCADE,
    PRIMARY KEY (business_id, employee_id)
);

-- 4. Create Media Table (Your new table)
CREATE TABLE media
(
    media_id           VARCHAR(36) PRIMARY KEY,
    title              VARCHAR(255),
    media_owner_name   VARCHAR(255),
    address            VARCHAR(255),
    type_of_display    VARCHAR(50),
    loop_duration      INTEGER,
    resolution         VARCHAR(50),
    aspect_ratio       VARCHAR(20),
    width              DOUBLE PRECISION,
    height             DOUBLE PRECISION,
    price              DECIMAL(10, 2),
    daily_impressions  INTEGER,
    schedule           JSONB,
    status             VARCHAR(50),
    image_file_name    VARCHAR(512),
    image_content_type VARCHAR(100),
    image_data         bytea
);

-- 5. Create Ad Campaigns Table
CREATE TABLE ad_campaigns
(
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL
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

