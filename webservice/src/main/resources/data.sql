INSERT INTO address (street, city, state, zip_code, country)
VALUES ('123 Baker St', 'Montreal', 'QC', 'H3Z 2Y7', 'Canada'),
       ('500 Tech Blvd', 'Toronto', 'ON', 'M5V 2T6', 'Canada'),
       ('789 Stanley Park Dr', 'Vancouver', 'BC', 'V6G 3E2', 'Canada'),
       ('404 Rocky View Rd', 'Calgary', 'AB', 'T3K 5Y6', 'Canada'),
       ('88 Parliament Hill', 'Ottawa', 'ON', 'K1A 0A6', 'Canada') ON CONFLICT (id) DO NOTHING;

INSERT INTO business (business_id, name, owner_id, company_size, address_id, media_owner, advertiser, date_created)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Mom & Pop Bakery', 'auth0|6934e8515479d2b6d3cf7575', 'SMALL', 1, true,
        true, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'TechGiant Solutions', null, 'ENTERPRISE', 2, false, true, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'Lotus Yoga Studio', null, 'LARGE', 3, true, false, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b44', 'Prairie Oil & Gas', null, 'ENTERPRISE', 4, true, false, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b55', 'Capital Consulting', null, 'MEDIUM', 5, false, true,
NOW()) ON CONFLICT (id) DO NOTHING;

INSERT INTO business_employees (business_id, employee_id)
VALUES (1, 'auth0|6934e8515479d2b6d3cf7575'),
       (1, 'auth0|693746439e8a7ab9e8b910b2') ON CONFLICT (business_id, employee_id) DO NOTHING;

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
     49.289300, -123.116226),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'Toronto Eaton Centre LED Wall', 'Indoor shopping mall LED mega wall',
    'Canada', 'ON', 'Toronto', '220 Yonge St', 'M5B 2H1',
    43.654438, -79.380699),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008', 'Ottawa Parliament Hill Board', 'Digital board near major tourist attraction',
    'Canada', 'ON', 'Ottawa', '111 Wellington St', 'K1A 0A6',
    45.423593, -75.700929),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009', 'Edmonton ICE District Screen', 'Large outdoor screen in entertainment district',
    'Canada', 'AB', 'Edmonton', '10220 104 Ave NW', 'T5J 0H6',
    53.546761, -113.497108),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010', 'Halifax Harbourfront Board', 'Waterfront display visible from pedestrian paths',
    'Canada', 'NS', 'Halifax', '150 Lower Water St', 'B3J 1R7',
    44.646299, -63.573021),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380011', 'Winnipeg Portage Avenue Screen', 'High-visibility downtown digital board',
    'Canada', 'MB', 'Winnipeg', '393 Portage Ave', 'R3B 3H6',
    49.896090, -97.143097),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380012', 'Quebec City Old Port Display', 'Tourism-heavy outdoor signage',
    'Canada', 'QC', 'Quebec City', '84 Rue Dalhousie', 'G1K 4C4',
    46.815183, -71.202423),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380013', 'Surrey Central Transit Screen', 'Transit hub screen with commuter traffic',
    'Canada', 'BC', 'Surrey', '10277 City Pkwy', 'V3T 4C6',
    49.187640, -122.849014),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380014', 'Brampton Downtown Centre Display', 'Medium digital board on main street',
    'Canada', 'ON', 'Brampton', '2 Wellington St W', 'L6Y 4R2',
    43.684211, -79.760070),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380015', 'Hamilton Pier 8 Waterfront Screen', 'Outdoor marina-side digital display',
    'Canada', 'ON', 'Hamilton', '47 Discovery Dr', 'L8L 8K4',
    43.276543, -79.857674),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380016', 'Regina Mosaic Stadium Board', 'Sports venue outdoor digital board',
    'Canada', 'SK', 'Regina', '1700 Elphinstone St', 'S4P 2Z6',
    50.454960, -104.633560),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380017', 'Saskatoon River Landing Display', 'Popular riverfront walkway screen',
    'Canada', 'SK', 'Saskatoon', '414 Spadina Crescent E', 'S7K 3G5',
    52.123982, -106.670300),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380018', 'Kelowna Lakeside LED Board', 'Tourist-heavy waterfront pathway display',
    'Canada', 'BC', 'Kelowna', '1350 Water St', 'V1Y 9P3',
    49.888159, -119.496582),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380019', 'London Richmond Row Display', 'Downtown nightlife district signage',
    'Canada', 'ON', 'London', '215 Dundas St', 'N6A 1H1',
    42.984923, -81.246079),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380020', 'Victoria Inner Harbour Board', 'High-vis digital signage at harbour entrance',
    'Canada', 'BC', 'Victoria', '900 Wharf St', 'V8W 1T3',
    48.422299, -123.369232),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380021', 'Niagara Falls Clifton Hill Screen', 'Tourist area mega-screen near main attractions',
    'Canada', 'ON', 'Niagara Falls', '4955 Clifton Hill', 'L2G 3N5',
    43.090490, -79.074376);

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
    'ACTIVE', 'unionstation.jpg', 'image/jpeg', NULL
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
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007',
    'Eaton Centre LED Wall', 'ShopMedia', 'DIGITAL',
    20, '1920x1080', '16:9',
    1920, 1080, 175.00, 30000,
    '{
        "selectedMonths": ["January", "February", "March"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime": "10:00","endTime": "22:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime": "10:00","endTime": "22:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime": "10:00","endTime": "22:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime": "10:00","endTime": "22:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime": "10:00","endTime": "22:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime": "09:00","endTime": "23:00"},
            {"dayOfWeek": "sunday","isActive": false,"startTime": null,"endTime": null}
        ]
    }'::jsonb,
    'ACTIVE', 'eaton_wall.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008',
    'Parliament Hill Digital Board', 'GovMedia', 'DIGITAL',
    25, '2560x1440', '16:9',
    2560, 1440, 220.00, 26000,
    '{
        "selectedMonths": ["April", "May", "June"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": false, "startTime": null,"endTime": null},
            {"dayOfWeek": "tuesday","isActive": true,"startTime": "08:00","endTime": "20:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime": "08:00","endTime": "20:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime": "08:00","endTime": "20:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime": "08:00","endTime": "20:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime": "09:00","endTime": "18:00"},
            {"dayOfWeek": "sunday","isActive": false,"startTime": null,"endTime": null}
        ]
    }'::jsonb,
    'ACTIVE', 'parliament.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009',
    'ICE District Mega Screen', 'Arena Media', 'DIGITAL',
    30, '3840x2160', '16:9',
    3840, 2160, 300.00, 42000,
    '{
        "selectedMonths": ["July", "August", "September"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime": "11:00","endTime": "23:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime": "11:00","endTime": "23:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime": "11:00","endTime": "23:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime": "11:00","endTime": "23:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime": "10:00","endTime": "23:59"},
            {"dayOfWeek": "saturday","isActive": true,"startTime": "10:00","endTime": "23:59"},
            {"dayOfWeek": "sunday","isActive": false,"startTime": null,"endTime": null}
        ]
    }'::jsonb,
    'ACTIVE', 'ice_district.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010',
    'Halifax Harbourfront Screen', 'Atlantic Media', 'DIGITAL',
    40, '1920x1080', '16:9',
    1920, 1080, 160.00, 20000,
    '{
        "selectedMonths": ["January", "February", "December"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime": "09:00","endTime": "18:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime": "09:00","endTime": "18:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime": "09:00","endTime": "18:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime": "09:00","endTime": "18:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime": "09:00","endTime": "21:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime": "10:00","endTime": "22:00"},
            {"dayOfWeek": "sunday","isActive": false,"startTime": null,"endTime": null}
        ]
    }'::jsonb,
    'PENDING', 'halifax_board.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007',
    'Eaton Centre LED Wall - North', 'ShopMedia', 'DIGITAL',
    20, '1920x1080', '16:9',
    1920, 1080, 175.00, 30000,
    '{
        "selectedMonths": ["January", "February", "March"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime":"09:00","endTime":"23:00"},
            {"dayOfWeek": "sunday","isActive": false,"startTime":null,"endTime":null}
        ]
    }'::jsonb,
    'ACTIVE', 'eaton_wall_north.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007',
    'Eaton Centre LED Wall - South', 'AdCentral', 'DIGITAL',
    25, '2560x1440', '16:9',
    2560, 1440, 185.00, 28000,
    '{
        "selectedMonths": ["April", "May"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime":"11:00","endTime":"21:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime":"11:00","endTime":"21:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime":"11:00","endTime":"21:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime":"11:00","endTime":"21:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime":"11:00","endTime":"22:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime":"10:00","endTime":"23:00"},
            {"dayOfWeek": "sunday","isActive": false,"startTime":null,"endTime":null}
        ]
    }'::jsonb,
    'ACTIVE', 'eaton_wall_south.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008',
    'Parliament Hill Visitor Screen', 'GovMedia', 'DIGITAL',
    30, '1920x1080', '16:9',
    1920, 1080, 190.00, 24000,
    '{
        "selectedMonths": ["March", "April", "May"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": false,"startTime":null,"endTime":null},
            {"dayOfWeek": "tuesday","isActive": true,"startTime":"08:00","endTime":"20:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime":"08:00","endTime":"20:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime":"08:00","endTime":"20:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime":"08:00","endTime":"21:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime":"09:00","endTime":"19:00"},
            {"dayOfWeek": "sunday","isActive": false,"startTime":null,"endTime":null}
        ]
    }'::jsonb,
    'ACTIVE', 'parliament_visitor.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008',
    'Parliament Hill South Gate Screen', 'FederalAds', 'DIGITAL',
    35, '2560x1440', '16:9',
    2560, 1440, 210.00, 26000,
    '{
        "selectedMonths": ["June", "July"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime":"09:00","endTime":"18:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime":"09:00","endTime":"18:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime":"09:00","endTime":"18:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime":"09:00","endTime":"18:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime":"09:00","endTime":"20:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "sunday","isActive": false,"startTime":null,"endTime":null}
        ]
    }'::jsonb,
    'PENDING', 'parliament_south_gate.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009',
    'ICE District Arena Board', 'ArenaMedia', 'DIGITAL',
    20, '1920x1080', '16:9',
    1920, 1080, 250.00, 45000,
    '{
        "selectedMonths": ["January", "February"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime":"11:00","endTime":"23:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime":"11:00","endTime":"23:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime":"11:00","endTime":"23:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime":"11:00","endTime":"23:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime":"10:00","endTime":"23:59"},
            {"dayOfWeek": "saturday","isActive": true,"startTime":"10:00","endTime":"23:59"},
            {"dayOfWeek": "sunday","isActive": false,"startTime":null,"endTime":null}
        ]
    }'::jsonb,
    'ACTIVE', 'ice_arena.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009',
    'ICE Plaza Outdoor Screen', 'NorthernAds', 'DIGITAL',
    45, '3840x2160', '16:9',
    3840, 2160, 320.00, 47000,
    '{
        "selectedMonths": ["April", "May", "June"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime":"10:00","endTime":"23:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime":"10:00","endTime":"23:59"},
            {"dayOfWeek": "sunday","isActive": false,"startTime":null,"endTime":null}
        ]
    }'::jsonb,
    'ACTIVE', 'ice_plaza.jpg', 'image/jpeg', NULL
),

(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010',
    'Harbourfront Pier Screen', 'AtlanticAds', 'DIGITAL',
    25, '1920x1080', '16:9',
    1920, 1080, 140.00, 23000,
    '{
        "selectedMonths": ["September", "October"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": true,"startTime":"08:00","endTime":"19:00"},
            {"dayOfWeek": "tuesday","isActive": true,"startTime":"08:00","endTime":"19:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime":"08:00","endTime":"19:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime":"08:00","endTime":"19:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime":"08:00","endTime":"22:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime":"09:00","endTime":"23:00"},
            {"dayOfWeek": "sunday","isActive": false,"startTime":null,"endTime":null}
        ]
    }'::jsonb,
    'ACTIVE', 'halifax_pier.jpg', 'image/jpeg', NULL
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010',
    'Harbourfront Market Screen', 'Seaside Media', 'DIGITAL',
    35, '2560x1440', '16:9',
    2560, 1440, 165.00, 21000,
    '{
        "selectedMonths": ["November", "December"],
        "weeklySchedule": [
            {"dayOfWeek": "monday","isActive": false,"startTime":null,"endTime":null},
            {"dayOfWeek": "tuesday","isActive": true,"startTime":"10:00","endTime":"18:00"},
            {"dayOfWeek": "wednesday","isActive": true,"startTime":"10:00","endTime":"18:00"},
            {"dayOfWeek": "thursday","isActive": true,"startTime":"10:00","endTime":"18:00"},
            {"dayOfWeek": "friday","isActive": true,"startTime":"10:00","endTime":"20:00"},
            {"dayOfWeek": "saturday","isActive": true,"startTime":"10:00","endTime":"22:00"},
            {"dayOfWeek": "sunday","isActive": true,"startTime":"10:00","endTime":"18:00"}
        ]
    }'::jsonb,
    'ACTIVE', 'halifax_market.jpg', 'image/jpeg', NULL
);
