DROP TABLE IF EXISTS verification CASCADE;
DROP TABLE IF EXISTS invitation CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
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
    id                INT AUTO_INCREMENT PRIMARY KEY,
    business_id       VARCHAR(36) UNIQUE NOT NULL,
    name              VARCHAR(255)       NOT NULL,
    organization_size VARCHAR(50)        NOT NULL,
    date_created      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address_id        INT,
    owner_id          VARCHAR(36),
    media_owner       BOOLEAN,
    advertiser        BOOLEAN,
    verified          BOOLEAN   DEFAULT FALSE,

    CONSTRAINT fk_address
        FOREIGN KEY (address_id)
            REFERENCES address (id)
            ON DELETE CASCADE
);

CREATE TABLE employee
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(36) UNIQUE NOT NULL,
    user_id     VARCHAR(36) UNIQUE NOT NULL,
    business_id VARCHAR(36)        NOT NULL,
    email       VARCHAR(255),

    CONSTRAINT fk_eb FOREIGN KEY (business_id) REFERENCES business (business_id) ON DELETE CASCADE
);

CREATE TABLE invitation
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    invitation_id VARCHAR(36) UNIQUE NOT NULL,
    business_id   VARCHAR(36)        NOT NULL,
    email         VARCHAR(255)       NOT NULL,
    token         VARCHAR(100)       NOT NULL,
    time_created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_expires  TIMESTAMP,

    CONSTRAINT fk_ib FOREIGN KEY (business_id) REFERENCES business (business_id) ON DELETE CASCADE
);

CREATE TABLE verification
(
    id              INT AUTO_INCREMENT PRIMARY KEY,
    verification_id VARCHAR(36) NOT NULL UNIQUE,
    business_id     VARCHAR(36) NOT NULL,
    status          VARCHAR(8)  NOT NULL DEFAULT 'PENDING',
    comments        VARCHAR(512),
    date_created    TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    date_modified   TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vb
        FOREIGN KEY (business_id)
            REFERENCES business (business_id)
            ON DELETE CASCADE
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