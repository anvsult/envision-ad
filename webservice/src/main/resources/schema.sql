DROP TABLE IF EXISTS media;

CREATE TABLE media (
       media_id VARCHAR(36) PRIMARY KEY,
       media_owner_name VARCHAR(255),
       title VARCHAR(255),
       resolution VARCHAR(50),
       type_of_display VARCHAR(50),
       aspect_ratio VARCHAR(20),
       address VARCHAR(255),
       schedule VARCHAR(255),
       status VARCHAR(50)
);