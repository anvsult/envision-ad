INSERT INTO address (street, city, state, zip_code, country)
VALUES ('900 Rue Riverside', 'Saint-Lambert', 'QC', 'J4P 3P2', 'Canada'),
       ('500 Tech Blvd', 'Toronto', 'ON', 'M5V 2T6', 'Canada'),
       ('789 Stanley Park Dr', 'Vancouver', 'BC', 'V6G 3E2', 'Canada'),
       ('404 Rocky View Rd', 'Calgary', 'AB', 'T3K 5Y6', 'Canada'),
       ('88 Parliament Hill', 'Ottawa', 'ON', 'K1A 0A6', 'Canada')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO business (business_id, name, owner_id, organization_size, address_id, media_owner, advertiser, date_created)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Champlain College', 'auth0|6934e8515479d2b6d3cf7575', 'MEDIUM', 1, true,
        true, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'TechGiant Solutions', null, 'ENTERPRISE', 2, false, true, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'Lotus Yoga Studio', null, 'LARGE', 3, true, false, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b44', 'Prairie Oil & Gas', null, 'ENTERPRISE', 4, true, false, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b55', 'Capital Consulting', null, 'MEDIUM', 5, false, true,
        NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO employee (employee_id, user_id, business_id)
VALUES ('94471b2f-8e87-4f47-bb14-604b8c4a32e6', 'auth0|6934e8515479d2b6d3cf7575', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11')
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO invitation (invitation_id, business_id, email, token, time_created, time_expires)
VALUES ('6bb9b68a-a072-4f28-aaa0-601087d03401', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'test@email.com', '1dd9f712-d3e8-4714-a1dd-08d95012b122', NOW(), NOW() + INTERVAL '1 hour')
ON CONFLICT (invitation_id) DO NOTHING;

INSERT INTO media_location (media_location_id, name, description, country, province, city, street, postal_code, latitude, longitude)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Champlain College Gym Hallway', 'Digital screen located near the campus gym and fitness facilities. This screen reaches a health-conscious, active audience during workouts and transitions, offering repeated exposure in a performance-focused environment.',
     'Canada', 'QC', 'Saint-Lambert', '900 Rue Riverside', 'J4P 3P2',
     45.501600, -73.554600),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Champlain College Main Entrance', 'Digital screen installed at the main campus entrance, visible to students, staff, and visitors entering the building. This location provides strong first-contact visibility and repeated exposure throughout the day during peak arrival and departure periods.',
     'Canada', 'QC', 'Saint-Lambert', '900 Rue Riverside', 'J4P 3P2',
     45.501600, -73.554600),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'Champlain College Student Lounge 1', 'Screen installed inside a student lounge area where students spend extended time seated or socializing. This placement offers longer dwell time and increased message retention in a relaxed and attentive setting.',
     'Canada', 'QC', 'Saint-Lambert', '900 Rue Riverside', 'J4P 3P2',
     45.501600, -73.554600),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'Entrepôt en Folie Main Entrance', 'Digital screen installed at the store’s main entrance, visible to all incoming customers. This placement delivers immediate brand exposure at the start of the shopping experience and benefits from consistent foot traffic.',
     'Canada', 'QC', 'Longueuil', '2685 Ch. de Chambly', 'J4L 1M3',
     45.524800, -73.465800),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'Ping Mo Digital Board', 'Screens positioned in entertainment venues or shopping centers with steady visitor flow. These environments offer broad reach and repeated visibility among a diverse audience in a dynamic and discovery-driven setting.',
     'Canada', 'QC', 'Montreal', '3575 Av. du Parc', 'H2X 3P9',
     45.510290, -73.575050),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'Upstairs Hallway A Block', 'Premium digital screen along popular tourist waterfront',
     'Canada', 'QC', 'Saint-Lambert', '900 Rue Riverside', 'J4P 3P2',
     45.501600, -73.554600),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'Lola Salon Main Lobby', 'Digital screen installed inside a women-focused hair salon, where clients spend extended time seated during appointments. This environment offers high dwell time and sustained attention in a calm, personal setting, making it particularly effective for brands targeting a female audience, including beauty, wellness, lifestyle, and local services.',
     'Canada', 'QC', 'Brossard', '4785 Grande Allée', 'J4Z 3G1',
     45.481660, -73.454690),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008', 'Cafeteria Entrance', 'Screen positioned at the cafeteria entrance, capturing attention during meal periods when student traffic is at its highest. This placement benefits from repeated daily exposure and extended dwell time around food and social activity areas.',
     'Canada', 'QC', 'Saint-Lambert', '900 Rue Riverside', 'J4P 3P2',
     45.501600, -73.554600),

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
    schedule, status,
    image_url
)
VALUES (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
           'Gym Hallway Digital Board', 'Champlain College', 'DIGITAL',
           30, '2160x3840', '9:16',
           2160, 3840, 26.45, 1200,
           '{
               "selectedMonths": ["January", "February", "March", "April", "May", "September", "October", "November", "December"],
               "weeklySchedule": [
                   {"dayOfWeek": "monday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "wednesday","isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "thursday", "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "friday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "saturday", "isActive": false, "startTime": null, "endTime": null},
                   {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
               ]
           }'::jsonb,
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407525/IMG_3834_uagq7g.jpg'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002',
           'Main Entrance Digital Board ', 'Champlain College', 'DIGITAL',
           30, '2160x3840', '9:16',
           2160, 3840, 26.45, 1200,
           '{
         "selectedMonths": ["January", "February", "March", "April", "May", "September", "October", "November", "December"],
               "weeklySchedule": [
                   {"dayOfWeek": "monday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "wednesday","isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "thursday", "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "friday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "saturday", "isActive": false, "startTime": null, "endTime": null},
                   {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
               ]
           }'::jsonb,
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768504494/IMG_3783_hkaz3g.jpg'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003',
           'Student Lounge 1', 'Champlain College', 'DIGITAL',
           30, '2160x3840', '9:16',
           2160, 3840, 26.45, 1200,
           '{
                "selectedMonths": ["January", "February", "March", "April", "May", "September", "October", "November", "December"],
               "weeklySchedule": [
                   {"dayOfWeek": "monday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "wednesday","isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "thursday", "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "friday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "saturday", "isActive": false, "startTime": null, "endTime": null},
                   {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
               ]
           }'::jsonb,
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407532/IMG_4963_ufrd4d.jpg'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004',
           'Entrepôt en Folie Main Entrance', 'Entrepôt en Folie', 'DIGITAL',
           60, '2160x3840', '9:16',
           2160, 3840, 5.65, 1875,
           '{
                "selectedMonths": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
               "weeklySchedule": [
                   {"dayOfWeek": "monday",   "isActive": true,  "startTime": "09:00", "endTime": "22:00"},
                   {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "09:00", "endTime": "22:00"},
                   {"dayOfWeek": "wednesday","isActive": true,  "startTime": "09:00", "endTime": "22:00"},
                   {"dayOfWeek": "thursday", "isActive": true,  "startTime": "09:00", "endTime": "21:00"},
                   {"dayOfWeek": "friday",   "isActive": true,  "startTime": "09:00", "endTime": "21:00"},
                   {"dayOfWeek": "saturday", "isActive": true,  "startTime": "09:00", "endTime": "17:00"},
                   {"dayOfWeek": "sunday",   "isActive": false, "startTime": "09:00", "endTime": "17:00"}
               ]
           }'::jsonb,
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407525/IMG_4934_iykhic.jpg'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005',
           'Ping Mo Store Entrance', 'Ping Mo', 'DIGITAL',
           60, '3840x2160', '16:9',
           3840, 2160, 7.55, 1875,
           '{
                "selectedMonths": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
               "weeklySchedule": [
                   {"dayOfWeek": "monday",   "isActive": false, "startTime": "07:00", "endTime": "23:00"},
                   {"dayOfWeek": "tuesday",  "isActive": false, "startTime": "07:00", "endTime": "23:00"},
                   {"dayOfWeek": "wednesday","isActive": true,  "startTime": "07:00", "endTime": "23:00"},
                   {"dayOfWeek": "thursday", "isActive": true,  "startTime": "07:00", "endTime": "23:00"},
                   {"dayOfWeek": "friday",   "isActive": true,  "startTime": "07:00", "endTime": "23:00"},
                   {"dayOfWeek": "saturday", "isActive": true,  "startTime": "07:00", "endTime": "23:00"},
                   {"dayOfWeek": "sunday",   "isActive": true,  "startTime": "07:00", "endTime": "23:00"}
               ]
           }'::jsonb,
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407525/IMG_4736_emvnha.jpg'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006',
           'Student Lounge 2', 'Champlain College', 'DIGITAL',
           30, '3840x2160', '16:9',
           3840, 2160, 26.45, 1200,
           '{
                "selectedMonths": ["January", "February", "March", "April", "May", "September", "October", "November", "December"],
                "weeklySchedule": [
                   {"dayOfWeek": "monday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "wednesday","isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "thursday", "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "friday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "saturday", "isActive": false, "startTime": null, "endTime": null},
                   {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
               ]
           }'::jsonb,
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407676/woiadydpsfax7aiajiee.jpg'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007',
           'Lola Salon Main Lobby', 'Lola Salon', 'DIGITAL',
           30, '1440x2560', '9:16',
           1440, 2560, 2.55, 56,
           '{
                "selectedMonths": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
               "weeklySchedule": [
                   {"dayOfWeek": "monday","isActive": false,"startTime": null,"endTime": null},
                   {"dayOfWeek": "tuesday","isActive": true,"startTime": "10:00","endTime": "17:00"},
                   {"dayOfWeek": "wednesday","isActive": true,"startTime": "09:00","endTime": "18:00"},
                   {"dayOfWeek": "thursday","isActive": true,"startTime": "09:00","endTime": "17:00"},
                   {"dayOfWeek": "friday","isActive": true,"startTime": "08:00","endTime": "18:00"},
                   {"dayOfWeek": "saturday","isActive": true,"startTime": "09:00","endTime": "16:00"},
                   {"dayOfWeek": "sunday","isActive": false,"startTime": null,"endTime": null}
               ]
           }'::jsonb,
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407524/3e4af6aa-17a5-47cf-a388-bbf13f451703_v4czap.jpg'
       ),

       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380008',
           'Cafeteria Entrance', 'Champlain College', 'DIGITAL',
           30, '3840x2160', '16:9',
           3840, 2160, 26.45, 1200,
           '{
              "selectedMonths": ["January", "February", "March", "April", "May", "September", "October", "November", "December"],
                "weeklySchedule": [
                   {"dayOfWeek": "monday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "tuesday",  "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "wednesday","isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "thursday", "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "friday",   "isActive": true,  "startTime": "07:30", "endTime": "18:30"},
                   {"dayOfWeek": "saturday", "isActive": false, "startTime": null, "endTime": null},
                   {"dayOfWeek": "sunday",   "isActive": false, "startTime": null, "endTime": null}
               ]
           }'::jsonb,
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768662804/Screenshot_2026-01-17_101221_dbsrlv.png'
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
           'PENDING','https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg'
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
           'PENDING', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg'
       ),

       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010',
           'Harbour Front Pier Screen', 'AtlanticAds', 'DIGITAL',
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
           'REJECTED', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010',
           'Harbour Front Market Screen', 'Seaside Media', 'DIGITAL',
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
           'REJECTED', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg'
       );;



-- =========================== ADS AND CAMPAIGNS DATA ===========================

-- 1. Insert Dummy Ad Campaigns
INSERT INTO ad_campaigns (campaign_id, business_id, name)
VALUES
    ('c1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11','Summer Sale 2025'),
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22','Black Friday Blitz'),
    ('f1e2d3c4-b5a6-4978-8c9d-0e1f2a3b4c5f', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11','New Year Launch');

-- 2. Insert Dummy Ads
-- Note: We use integers (1, 2, 3) for ad_campaign_ref_id based on the order of insertion above.

-- Ads for Campaign 1 (Summer Sale)
INSERT INTO ads (ad_id, name, ad_url, ad_duration_seconds, ad_type, ad_campaign_ref_id)
VALUES
    ('11111111-2222-3333-4444-555555555555', 'Summer Beach Banner', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg', 30, 'IMAGE', 1);

-- Ads for Campaign 2 (Black Friday)
INSERT INTO ads (ad_id, name, ad_url, ad_duration_seconds, ad_type, ad_campaign_ref_id)
VALUES
    ('33333333-4444-5555-6666-777777777777', 'BF Countdown Timer', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg', 15, 'IMAGE', 2),
    ('44444444-5555-6666-7777-888888888888', 'BF Main video', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg', 15, 'IMAGE', 2),
    ('55555555-6666-7777-8888-999999999999', 'Cyber Monday Teaser', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg', 30, 'IMAGE', 2);


