DROP TABLE IF EXISTS media;

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