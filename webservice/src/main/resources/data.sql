INSERT INTO address (street, city, state, zip_code, country)
VALUES ('900 Rue Riverside', 'Saint-Lambert', 'QC', 'J4P 3P2', 'Canada'),
       ('500 Tech Blvd', 'Toronto', 'ON', 'M5V 2T6', 'Canada'),
       ('789 Stanley Park Dr', 'Vancouver', 'BC', 'V6G 3E2', 'Canada'),
       ('404 Rocky View Rd', 'Calgary', 'AB', 'T3K 5Y6', 'Canada'),
       ('88 Parliament Hill', 'Ottawa', 'ON', 'K1A 0A6', 'Canada'),
       ('2685 Ch. de Chambly', 'Longueuil', 'QC', 'J4L 1M3', 'Canada'),
       ('4785 Grande Allée', 'Brossard', 'QC', 'J4Z 3G1', 'Canada'),
       ('3575 Av. du Parc', 'Montreal', 'QC', 'H2X 3P9', 'Canada'),
       ('10220 104 Ave NW','Edmonton', 'AB', 'T5J 0H6', 'Canada'),
       ('150 Lower Water St', 'Halifax', 'NS', 'B3J 1R7', 'Canada')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO business (business_id, name, owner_id, organization_size, address_id, media_owner, advertiser, date_created)
VALUES
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10', 'Visual Impact', 'auth0|6972cb215b943c997508c737', 'SMALL', 1, true, true, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Champlain College', 'auth0|6934e8515479d2b6d3cf7575', 'MEDIUM', 1, false, true, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'TechGiant Solutions', 'auth0|696a89137cfdb558ea4a4a4a', 'ENTERPRISE', 2, false, true, NOW()),
       ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'Lotus Yoga Studio', 'auth0|696a88eb347945897ef17093', 'LARGE', 3, false, true, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO employee (employee_id, user_id, business_id, email)
VALUES ('94471b2f-8e87-4f47-bb14-604b8c4a32e6', 'auth0|6934e8515479d2b6d3cf7575', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'christopher24hd@gmail.com'),
       ('a7413e1c-1fca-4cc8-8bc5-6a673b9635d5', 'auth0|6979541a0aa6c868cf029d34', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'megadoxs@gmail.com'),
       ('f0252067-78a2-41ea-ba88-34280aea7056', 'auth0|696a89137cfdb558ea4a4a4a', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'christopher24hd@gmail.com'),
       ('1f9b5afd-f206-447c-97b0-22002a4ff137', 'auth0|696a88eb347945897ef17093', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10', 'anv.sult@gmail.com'),
       ('5bac8f38-4cc6-44d3-b355-7e4c6ccd24e1', 'auth0|6972cb215b943c997508c737', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10', 'anv.sult@gmail.com')
    ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO invitation (invitation_id, business_id, email, token, time_created, time_expires)
VALUES ('6bb9b68a-a072-4f28-aaa0-601087d03401', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'test@email.com', '1dd9f712-d3e8-4714-a1dd-08d95012b122', NOW(), NOW() + INTERVAL '1 hour')
ON CONFLICT (invitation_id) DO NOTHING;

INSERT INTO verification (verification_id, business_id, status, comments, date_created, date_modified)
VALUES ('636e63e2-a3c0-4171-ac90-bfad8aeb6613', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'DENIED', 'Application denied due to invalid address entered', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP),
       ('75472797-b9e0-4e53-bdf8-81ffe57d9fa5', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'APPROVED', null, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('cf4dc890-d86c-48c4-9a8b-7705e0420da3', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'PENDING', null, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('ed2ecdbb-84e9-4625-8b06-3fb500d8d081', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'PENDING', null, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO media_location (media_location_id, name, description, country, province, city, street, postal_code, latitude, longitude)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Champlain College', 'A college campus where many students and teachers congregate to learn.',
     'Canada', 'QC', 'Saint-Lambert', '900 Rue Riverside', 'J4P 3P2',
     45.516476848520064, -73.52053208741675),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'Entrepôt en Folie', 'Digital screen installed at the store’s main entrance, visible to all incoming customers. This placement delivers immediate brand exposure at the start of the shopping experience and benefits from consistent foot traffic.',
     'Canada', 'QC', 'Longueuil', '2685 Ch. de Chambly', 'J4L 1M3',
     45.524800, -73.465800),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'Ping Mo', 'Screens positioned in entertainment venues or shopping centers with steady visitor flow. These environments offer broad reach and repeated visibility among a diverse audience in a dynamic and discovery-driven setting.',
     'Canada', 'QC', 'Montreal', '3575 Av. du Parc', 'H2X 3P9',
     45.510290, -73.575050),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'Lola Salon', 'Digital screen installed inside a women-focused hair salon, where clients spend extended time seated during appointments. This environment offers high dwell time and sustained attention in a calm, personal setting, making it particularly effective for brands targeting a female audience, including beauty, wellness, lifestyle, and local services.',
     'Canada', 'QC', 'Brossard', '4785 Grande Allée', 'J4Z 3G1',
     45.481660, -73.454690),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009', 'Edmonton ICE', 'Large outdoor screen in entertainment district',
     'Canada', 'AB', 'Edmonton', '10220 104 Ave NW', 'T5J 0H6',
     53.546761, -113.497108),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010', 'Halifax Harbourfront Board', 'Waterfront display visible from pedestrian paths',
     'Canada', 'NS', 'Halifax', '150 Lower Water St', 'B3J 1R7',
     44.646299, -63.573021);

INSERT INTO media (
    media_location_id,
    business_id,
    title, media_owner_name, type_of_display,
    loop_duration, resolution, aspect_ratio,
    width, height, price, daily_impressions,
    schedule, status,
    image_url, preview_configuration
)
VALUES (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407525/IMG_3834_uagq7g.jpg',
           '{"bl": {"x": 0.36904761904761907, "y": 0.5225}, "br": {"x": 0.6309523809523809, "y": 0.53}, "tl": {"x": 0.3541666666666667, "y": 0.095}, "tr": {"x": 0.6636904761904762, "y": 0.1075}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768504494/IMG_3783_hkaz3g.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1769924600/btye7o2f5r2rs4dpufqr.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407525/IMG_4934_iykhic.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407525/IMG_4736_emvnha.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1769924677/thk7w8zdkce1jcyjheix.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768407524/3e4af6aa-17a5-47cf-a388-bbf13f451703_v4czap.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'ACTIVE', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1768662804/Screenshot_2026-01-17_101221_dbsrlv.png',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'PENDING','https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380009',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'PENDING', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'REJECTED', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       ),
       (
           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380010',
           'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10',
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
           'REJECTED', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg',
           '{"bl": {"x": 0.1, "y": 0.9}, "br": {"x": 0.9, "y": 0.9}, "tl": {"x": 0.1, "y": 0.1}, "tr": {"x": 0.9, "y": 0.1}}'
       );

-- =========================== ADS AND CAMPAIGNS DATA ===========================

-- 1. Insert Dummy Ad Campaigns
INSERT INTO ad_campaigns (campaign_id, business_id, name)
VALUES
    ('c1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Summer Sale 2025'),
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'Black Friday Blitz');

-- 2. Insert Dummy Ads
INSERT INTO ads (ad_id, name, ad_url, ad_duration_seconds, ad_type, ad_campaign_ref_id)
VALUES
    ('33333333-4444-5555-6666-777777777777', 'BF Countdown Timer', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg', 15, 'IMAGE', 1),
    ('44444444-5555-6666-7777-888888888888', 'BF Main video', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg', 15, 'IMAGE', 2),
    ('55555555-6666-7777-8888-999999999999', 'Cyber Monday Teaser', 'https://res.cloudinary.com/dt3ru94xr/image/upload/v1765687012/izrudgmkxeohp1vhxlad.jpg', 30, 'IMAGE', 1);

-- =========================== STRIPE DATA ===========================

-- Insert Stripe accounts for all media owner businesses so they can receive payments
INSERT INTO stripe_accounts (business_id, stripe_account_id, onboarding_complete, charges_enabled, payouts_enabled)
VALUES
    -- Champlain College (your business - media owner and advertiser)
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10', 'acct_1SqyOW1H9mbHrgki', true, true, true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'acct_1SvU8z0pzJzD5uc6', true, true, true)
ON CONFLICT (business_id) DO UPDATE SET
    stripe_account_id = EXCLUDED.stripe_account_id,
    onboarding_complete = EXCLUDED.onboarding_complete,
    charges_enabled = EXCLUDED.charges_enabled,
    payouts_enabled = EXCLUDED.payouts_enabled;
