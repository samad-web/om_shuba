-- Fuzzy Match Fix for Missing Weeder Translations and Others
-- This script uses aggressive wildcard matching to catch products with slight name variations (e.g. hyphens vs dashes)

-- 1. Power Weeders (High Priority Fix)

-- 7.5 HP Petrol
UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 7.5 ஹெச்பி பெட்ரோல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '7.5 ஹெச்பி பெட்ரோல் மூலம் இயங்கும் வீடர்'
WHERE (name ILIKE '%Weeder%7.5%Petrol%' OR name ILIKE '%Weeder%7.5%HP%Petrol%');

-- 7.5 HP Diesel (Standard)
UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 7.5 ஹெச்பி டீசல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '7.5 ஹெச்பி டீசல் மூலம் இயங்கும் வீடர்'
WHERE (name ILIKE '%Weeder%7.5%Diesel%' OR name ILIKE '%Weeder%7.5%HP%Diesel%')
AND name NOT ILIKE '%Self Start%';

-- 7.5 HP Diesel (Self Start)
UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 7.5 ஹெச்பி டீசல் (செல்ஃப் ஸ்டார்ட்)', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '7.5 ஹெச்பி டீசல் மற்றும் செல்ஃப் ஸ்டார்ட் வசதியுடன்'
WHERE name ILIKE '%Weeder%7.5%Diesel%Self%Start%';

-- 9 HP Diesel
UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 9 ஹெச்பி டீசல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '9 ஹெச்பி டீசல் மூலம் இயங்கும் வலுவான வீடர்'
WHERE (name ILIKE '%Weeder%9%Diesel%' OR name ILIKE '%Weeder%9%HP%Diesel%')
AND name NOT ILIKE '%Rotavator%';

-- 6.5 HP with Back Rotavator
UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 6.5 ஹெச்பி டீசல் (பின்புற ரோட்டவேட்டருடன்)', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '6.5 ஹெச்பி டீசல் வீடர் - பின்புற ரோட்டவேட்டர் இணைக்கப்பட்டது'
WHERE name ILIKE '%Weeder%6.5%Back%Rotavator%';

-- 9 HP with Back Rotavator
UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 9 ஹெச்பி (பின்புற ரோட்டவேட்டருடன்)', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '9 ஹெச்பி வீடர் - பின்புற ரோட்டவேட்டர் இணைக்கப்பட்டது'
WHERE name ILIKE '%Weeder%9%Back%Rotavator%';

-- Baby Weeder
UPDATE products 
SET 
    name_ta = 'பேபி வீடர் – 3.5 ஹெச்பி பெட்ரோல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = 'சிறிய 3.5 ஹெச்பி பெட்ரோல் வீடர்'
WHERE name ILIKE '%Baby%Weeder%';

-- 2. Rotavators (Fuzzy Fixes)

-- 42 Blade Multi Gear
UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் – 42 பிளேடு மல்டி கியர்', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = '42 பிளேடு மல்டி கியர் ரோட்டவேட்டர்'
WHERE name ILIKE '%42%Blade%Multi%Gear%';

-- 42 Blade Single Gear
UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் – 42 பிளேடு சிங்கிள் கியர்', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = '42 பிளேடு சிங்கிள் கியர் ரோட்டவேட்டர்'
WHERE name ILIKE '%42%Blade%Single%Gear%';

-- Capital Plus 36 Blade Multi Gear
UPDATE products 
SET 
    name_ta = 'கேப்பிட்டல் பிளஸ் ரோட்டவேட்டர் – 36 பிளேடு மல்டி கியர்', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் பிளஸ் 36 பிளேடு மல்டி கியர்'
WHERE name ILIKE '%Capital%Plus%36%Blade%';

-- Captain 36 Blade Single Gear
UPDATE products 
SET 
    name_ta = 'கேப்டன் ரோட்டவேட்டர் – 36 பிளேடு சிங்கிள் கியர்', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்டன் சீரிஸ் 36 பிளேடு சிங்கிள் கியர்'
WHERE name ILIKE '%Captain%36%Blade%Single%';

-- Capital 42 Blade Model A
UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் கேப்பிட்டல் – 42 பிளேடு (மாடல் A)', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் 42 பிளேடு மாடல் A'
WHERE name ILIKE '%Capital%42%Blade%Model%A%';

-- Capital 42 Blade Model B
UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் கேப்பிட்டல் – 42 பிளேடு (மாடல் B)', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் 42 பிளேடு மாடல் B'
WHERE name ILIKE '%Capital%42%Blade%Model%B%';

-- Capital 36 Blade Model A
UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் கேப்பிட்டல் – 36 பிளேடு (மாடல் A)', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் 36 பிளேடு மாடல் A'
WHERE name ILIKE '%Capital%36%Blade%Model%A%';

-- Capital 36 Blade Model B
UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் கேப்பிட்டல் – 36 பிளேடு (மாடல் B)', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் 36 பிளேடு மாடல் B'
WHERE name ILIKE '%Capital%36%Blade%Model%B%';

-- 3. Milking Machines (Fuzzy Fixes)
UPDATE products SET name_ta = 'கறவை இயந்திரம் - நானோ மாடல்' WHERE name ILIKE '%Nano%Model%' AND name NOT ILIKE '%Super%';
UPDATE products SET name_ta = 'கறவை இயந்திரம் - சூப்பர் நானோ மாடல்' WHERE name ILIKE '%Super%Nano%';
UPDATE products SET name_ta = 'கறவை இயந்திரம் - ஒற்றை பக்கெட் மாடல்' WHERE name ILIKE '%Single%Bucket%';
UPDATE products SET name_ta = 'கறவை இயந்திரம் - டைமண்ட் மாடல்' WHERE name ILIKE '%Diamond%Model%';

-- 4. Chaff Cutters (Fuzzy Fixes)
UPDATE products SET name_ta = 'சாப் கட்டர் - பிரீமியம் மாடல்' WHERE name ILIKE '%Chop%Cutter%Premium%';
UPDATE products SET name_ta = 'சாப் கட்டர் - எலைட் மாடல்' WHERE name ILIKE '%Chop%Cutter%Elite%';
UPDATE products SET name_ta = 'சாப் கட்டர் - மாடல் 1 (கியர் இல்லாமல்)' WHERE name ILIKE '%Model%1%Without%Gear%';
UPDATE products SET name_ta = 'சாப் கட்டர் - மாடல் 2 (கியருடன்)' WHERE name ILIKE '%Model%2%With%Gear%';
