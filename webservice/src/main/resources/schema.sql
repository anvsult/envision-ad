CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Clean up old tables (Order matters: drop tables with FKs first)
DROP TABLE IF EXISTS business_employees CASCADE;
DROP TABLE IF EXISTS business_roles CASCADE;
DROP TABLE IF EXISTS business CASCADE;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS media;

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
        owner VARCHAR(36),

        CONSTRAINT fk_address
            FOREIGN KEY (address_id)
                REFERENCES address (id)
                ON DELETE CASCADE
);

CREATE TABLE business_employees (
    business_id UUID NOT NULL,
    employee_id VARCHAR(36),

    CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES business (id) ON DELETE CASCADE,
    PRIMARY KEY (business_id, employee_id)
);

-- need to confirm if this is the best approach
CREATE TABLE business_roles (
    business_id UUID NOT NULL,
    role varchar(36) NOT NULL,

    CONSTRAINT fk_business_roles FOREIGN KEY (business_id) REFERENCES business (id) ON DELETE CASCADE,
    PRIMARY KEY (business_id, role)
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
