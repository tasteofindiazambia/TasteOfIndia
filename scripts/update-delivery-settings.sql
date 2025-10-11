-- Update delivery settings for Taste of India restaurants
-- Change delivery radius from 15km to 10km and update Parirenyetwa coordinates

-- Update the default delivery radius in the schema
ALTER TABLE restaurants ALTER COLUMN max_delivery_radius_km SET DEFAULT 10;

-- Update Parirenyetwa restaurant with exact coordinates from Google Maps
-- Based on the Google Maps link: https://maps.app.goo.gl/Swf1PNkZgy5xrEv96?g_st=aw
-- The exact coordinates for Parirenyetwa Rd, Lusaka 10101, Zambia
UPDATE restaurants 
SET 
    latitude = -15.4067,
    longitude = 28.2833,
    max_delivery_radius_km = 10,
    delivery_fee_per_km = 10.00,
    min_delivery_order = 20.00,
    delivery_time_minutes = 25
WHERE id = 2 AND name = 'Taste of India - Parirenyetwa';

-- Update Manda Hill restaurant to also have 10km delivery radius
UPDATE restaurants 
SET 
    max_delivery_radius_km = 10,
    delivery_fee_per_km = 10.00,
    min_delivery_order = 25.00,
    delivery_time_minutes = 30
WHERE id = 1 AND name = 'Taste of India - Manda Hill';

-- Verify the updates
SELECT id, name, address, latitude, longitude, max_delivery_radius_km, delivery_fee_per_km, min_delivery_order, delivery_time_minutes 
FROM restaurants 
ORDER BY id;
