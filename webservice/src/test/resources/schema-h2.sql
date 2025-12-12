DROP TABLE IF EXISTS business_employees CASCADE;
DROP TABLE IF EXISTS business_roles CASCADE;
DROP TABLE IF EXISTS business CASCADE;
DROP TABLE IF EXISTS address CASCADE;
DROP TABLE IF EXISTS media CASCADE;

CREATE TABLE address
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    street   VARCHAR(255) NOT NULL,
    city     VARCHAR(255) NOT NULL,
    state    VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    country  VARCHAR(255) NOT NULL
);

CREATE TABLE business
(
    id           INT AUTO_INCREMENT PRIMARY KEY,
    business_id  VARCHAR(36) UNIQUE NOT NULL,
    name         VARCHAR(255)       NOT NULL,
    company_size VARCHAR(50)        NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address_id   INT,
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
    business_id INT         NOT NULL,
    employee_id VARCHAR(36) NOT NULL,

    CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES business (id) ON DELETE CASCADE,
    PRIMARY KEY (business_id, employee_id)
);

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
    schedule           CLOB,
    status             VARCHAR(50),
    image_file_name    VARCHAR(512),
    image_content_type VARCHAR(100),
    image_data         BLOB
);