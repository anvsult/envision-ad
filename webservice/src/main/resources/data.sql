INSERT INTO media (
    media_id, title, media_owner_name, address,
    type_of_display, loop_duration, resolution, aspect_ratio,
    width, height, price, daily_impressions, schedule, status,
    image_file_name, image_content_type, image_data
)
VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Downtown Billboard',
        'Envision Ads',
        '123 Main St, Montreal, QC',
        'DIGITAL',
        30,
        '1920x1080',
        '16:9',
        16.5,
        9.2,
        50.00,
        30,
        '{
            "selectedMonths": ["January", "February", "March", "April", "May", "June"],
            "days": {
                "monday":    {"isActive": true, "startTime": "09:00", "endTime": "17:00"},
                "tuesday":   {"isActive": true, "startTime": "09:00", "endTime": "17:00"},
                "wednesday": {"isActive": true, "startTime": "09:00", "endTime": "17:00"},
                "thursday":  {"isActive": true, "startTime": "09:00", "endTime": "17:00"},
                "friday":    {"isActive": true, "startTime": "09:00", "endTime": "17:00"},
                "saturday":  {"isActive": false, "startTime": "09:00", "endTime": "17:00"},
                "sunday":    {"isActive": false, "startTime": "09:00", "endTime": "17:00"}
            }
        }'::jsonb,                               -- schedule
        'ACTIVE',
        NULL,
        NULL,
        NULL
    ),
    (
        'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'Highway Banner',
        'Global Media',
        '456 Auto Route, Laval, QC',
        'POSTER',
        60,
        '3000x1000',
        '3:1',
        30.0,
        10.0,
        48.50,
        20,
        '{
            "selectedMonths": ["January", "February", "March", "April", "May", "June"],
            "days": {
                "monday":    {"isActive": true, "startTime": "00:00", "endTime": "00:00"},
                "tuesday":   {"isActive": true, "startTime": "00:00", "endTime": "00:00"},
                "wednesday": {"isActive": true, "startTime": "00:00", "endTime": "00:00"},
                "thursday":  {"isActive": true, "startTime": "00:00", "endTime": "00:00"},
                "friday":    {"isActive": true, "startTime": "00:00", "endTime": "00:00"},
                "saturday":  {"isActive": true, "startTime": "00:00", "endTime": "00:00"},
                "sunday":    {"isActive": true, "startTime": "00:00", "endTime": "00:00"}
            }
        }'::jsonb,
        'INACTIVE',
        NULL,
        NULL,
        NULL
    ),
    (
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'Subway Screen',
        'Metro Ads',
        '789 Station Blvd, Longueuil, QC',
        'DIGITAL',
        90,
        '1080x1920',
        '9:16',
        2.5,
        4.5,
        30.75,
        25,
        '{
            "selectedMonths": ["January", "February", "March", "April", "May", "June"],
            "days": {
                "monday":    {"isActive": false, "startTime": "09:00", "endTime": "17:00"},
                "tuesday":   {"isActive": false, "startTime": "09:00", "endTime": "17:00"},
                "wednesday": {"isActive": false, "startTime": "09:00", "endTime": "17:00"},
                "thursday":  {"isActive": false, "startTime": "09:00", "endTime": "17:00"},
                "friday":    {"isActive": false, "startTime": "09:00", "endTime": "17:00"},
                "saturday":  {"isActive": true, "startTime": "10:00", "endTime": "22:00"},
                "sunday":    {"isActive": true, "startTime": "10:00", "endTime": "18:00"}
            }
        }'::jsonb,
        'PENDING',
        NULL,
        NULL,
        NULL
    );