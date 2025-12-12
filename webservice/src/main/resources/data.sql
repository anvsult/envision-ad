INSERT INTO address (id, street, city, state, zip_code, country)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '123 Baker St', 'Montreal', 'QC', 'H3Z 2Y7', 'Canada')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO address (id, street, city, state, zip_code, country)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '500 Tech Blvd', 'Toronto', 'ON', 'M5V 2T6', 'Canada')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO address (id, street, city, state, zip_code, country)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '789 Stanley Park Dr', 'Vancouver', 'BC', 'V6G 3E2', 'Canada')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO address (id, street, city, state, zip_code, country)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '404 Rocky View Rd', 'Calgary', 'AB', 'T3K 5Y6', 'Canada')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO address (id, street, city, state, zip_code, country)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '88 Parliament Hill', 'Ottawa', 'ON', 'K1A 0A6', 'Canada')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO business (id, name, company_size, address_id, date_created)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Mom & Pop Bakery', 'SMALL', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW())
    ON CONFLICT (id) DO NOTHING;

INSERT INTO business (id, name, company_size, address_id, date_created)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'TechGiant Solutions', 'ENTERPRISE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', NOW())
    ON CONFLICT (id) DO NOTHING;

INSERT INTO business (id, name, company_size, address_id, date_created)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'Lotus Yoga Studio', 'LARGE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', NOW())
    ON CONFLICT (id) DO NOTHING;

INSERT INTO business (id, name, company_size, address_id, date_created)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b44', 'Prairie Oil & Gas', 'ENTERPRISE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', NOW())
    ON CONFLICT (id) DO NOTHING;

INSERT INTO business (id, name, company_size, address_id, date_created)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b55', 'Capital Consulting', 'MEDIUM', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', NOW())
    ON CONFLICT (id) DO NOTHING;

INSERT INTO media_location (media_location_id, name, description, country, province, city, street, postal_code, latitude, longitude)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Downtown Billboard A', 'Large DIGITAL billboard near main intersection',
     'Canada', 'ON', 'Toronto', '123 King St W', 'M5H 1A1',
     43.651070, -79.347015),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Highway 401 Mega Screen', 'Massive digital board facing expressway traffic',
     'Canada', 'ON', 'Mississauga', '401 Expressway Westbound', 'L4W 1S2',
     43.660500, -79.636900),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'Union Station Atrium Display', 'Indoor transit hub screen with high foot traffic',
     'Canada', 'ON', 'Toronto', '65 Front St W', 'M5J 1E6',
     43.645330, -79.380580),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'Montreal Downtown Wrap Display', 'Full-building wrap-style digital display',
     'Canada', 'QC', 'Montreal', '800 Sainte-Catherine St W', 'H3B 1B1',
     45.501690, -73.567253),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'Calgary Stadium DIGITAL Board', 'Outdoor DIGITAL panel at sports & event venue',
     'Canada', 'AB', 'Calgary', '555 SaddDIGITALome Rise SE', 'T2G 2W1',
     51.037400, -114.051900),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'Vancouver Waterfront Screen', 'Premium digital screen along popular tourist waterfront',
     'Canada', 'BC', 'Vancouver', '999 Canada Pl', 'V6C 3T4',
     49.289300, -123.116226);



INSERT INTO media (
    media_location_id,
    title, media_owner_name, type_of_display,
    loop_duration, resolution, aspect_ratio,
    width, height, price, daily_impressions,
    schedule, status, image_file_name,
    image_content_type, image_data
)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'Downtown Digital Board', 'MetroAds', 'DIGITAL',
    30, '1920x1080', '16:9',
    1920, 1080, 150.00, 25000,
    '{
        "selectedMonths": ["January", "February", "March", "April", "May", "June"],
        "weeklySchedule": [
            {"dayOfWeek": "monday",   "isActive": true,  "startTime": "09:00", "endTime": "17:00"},
            {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "09:00", "endTime": "17:00"},
            {"dayOfWeek": "wednesday","isActive": true,  "startTime": "09:00", "endTime": "17:00"},
            {"dayOfWeek": "thursday", "isActive": true,  "startTime": "09:00", "endTime": "17:00"},
            {"dayOfWeek": "friday",   "isActive": true,  "startTime": "09:00", "endTime": "17:00"},
            {"dayOfWeek": "saturday", "isActive": false, "startTime": null, "endTime": null},
            {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
        ]
    }'::jsonb,
    'ACTIVE', 'screen1.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002',
    'Highway 401 Mega Screen', 'Express Media', 'DIGITAL',
    60, '3840x1080', '32:9',
    3840, 1080, 300.00, 40000,
    '{
        "selectedMonths": ["January", "February", "March"],
        "weeklySchedule": [
            {"dayOfWeek": "monday",   "isActive": true,  "startTime": "06:00", "endTime": "22:00"},
            {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "06:00", "endTime": "22:00"},
            {"dayOfWeek": "wednesday","isActive": true,  "startTime": "06:00", "endTime": "22:00"},
            {"dayOfWeek": "thursday", "isActive": true,  "startTime": "06:00", "endTime": "22:00"},
            {"dayOfWeek": "friday",   "isActive": true,  "startTime": "06:00", "endTime": "22:00"},
            {"dayOfWeek": "saturday", "isActive": true,  "startTime": "08:00", "endTime": "20:00"},
            {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
        ]
    }'::jsonb,
    'ACTIVE', 'highway1.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003',
    'Union Station Atrium Screen', 'Transit Media', 'DIGITAL',
    20, '1920x1080', '16:9',
    1920, 1080, 120.00, 15000,
    '{
        "selectedMonths": ["April", "May", "June"],
        "weeklySchedule": [
            {"dayOfWeek": "monday",   "isActive": true,  "startTime": "07:00", "endTime": "21:00"},
            {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "07:00", "endTime": "21:00"},
            {"dayOfWeek": "wednesday","isActive": true,  "startTime": "07:00", "endTime": "21:00"},
            {"dayOfWeek": "thursday", "isActive": true,  "startTime": "07:00", "endTime": "21:00"},
            {"dayOfWeek": "friday",   "isActive": true,  "startTime": "07:00", "endTime": "21:00"},
            {"dayOfWeek": "saturday", "isActive": false, "startTime": null, "endTime": null},
            {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
        ]
    }'::jsonb,
    'PENDING', 'unionstation.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004',
    'Montreal Downtown Wrap', 'Urban Media', 'DIGITAL',
    45, '1080x1920', '9:16',
    1080, 1920, 200.00, 18000,
    '{
        "selectedMonths": ["July", "August", "September"],
        "weeklySchedule": [
            {"dayOfWeek": "monday",   "isActive": true,  "startTime": "10:00", "endTime": "22:00"},
            {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "10:00", "endTime": "22:00"},
            {"dayOfWeek": "wednesday","isActive": true,  "startTime": "10:00", "endTime": "22:00"},
            {"dayOfWeek": "thursday", "isActive": true,  "startTime": "10:00", "endTime": "22:00"},
            {"dayOfWeek": "friday",   "isActive": true,  "startTime": "10:00", "endTime": "22:00"},
            {"dayOfWeek": "saturday", "isActive": true,  "startTime": "12:00", "endTime": "20:00"},
            {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
        ]
    }'::jsonb,
    'ACTIVE', 'montreal_wrap.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005',
    'Calgary Stadium DIGITAL', 'Sports Media', 'DIGITAL',
    60, '3840x2160', '16:9',
    3840, 2160, 350.00, 50000,
    '{
        "selectedMonths": ["September", "October", "November"],
        "weeklySchedule": [
            {"dayOfWeek": "monday",   "isActive": false, "startTime": null, "endTime": null},
            {"dayOfWeek": "tuesday",  "isActive": false, "startTime": null, "endTime": null},
            {"dayOfWeek": "wednesday","isActive": true,  "startTime": "12:00", "endTime": "23:00"},
            {"dayOfWeek": "thursday", "isActive": true,  "startTime": "12:00", "endTime": "23:00"},
            {"dayOfWeek": "friday",   "isActive": true,  "startTime": "12:00", "endTime": "23:00"},
            {"dayOfWeek": "saturday", "isActive": true,  "startTime": "10:00", "endTime": "23:00"},
            {"dayOfWeek": "sunday",   "isActive": true,  "startTime": "10:00", "endTime": "20:00"}
        ]
    }'::jsonb,
    'ACTIVE', 'calgary_stadium.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006',
    'Vancouver Waterfront DIGITAL', 'Tourism Media', 'DIGITAL',
    30, '1920x1080', '16:9',
    1920, 1080, 180.00, 22000,
    '{
        "selectedMonths": ["December", "January", "February"],
        "weeklySchedule": [
            {"dayOfWeek": "monday",   "isActive": true,  "startTime": "09:00", "endTime": "21:00"},
            {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "09:00", "endTime": "21:00"},
            {"dayOfWeek": "wednesday","isActive": true,  "startTime": "09:00", "endTime": "21:00"},
            {"dayOfWeek": "thursday", "isActive": true,  "startTime": "09:00", "endTime": "21:00"},
            {"dayOfWeek": "friday",   "isActive": true,  "startTime": "09:00", "endTime": "21:00"},
            {"dayOfWeek": "saturday", "isActive": true,  "startTime": "10:00", "endTime": "22:00"},
            {"dayOfWeek": "sunday",   "isActive": true,  "startTime": "10:00", "endTime": "22:00"}
        ]
    }'::jsonb,
    'PENDING', 'vancouver_waterfront.jpg', 'image/jpeg', NULL
);
