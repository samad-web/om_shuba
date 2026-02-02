-- Complete Product Localization Script
-- This script updates ALL products defined in seed_data.sql with their Tamil translations

-- 1. Weeders (p1-p7)
UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 7.5 ஹெச்பி பெட்ரோல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '7.5 ஹெச்பி பெட்ரோல் மூலம் இயங்கும் வீடர்'
WHERE id = 'p1' OR name = 'Power Weeder – 7.5 HP Petrol';

UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 7.5 ஹெச்பி டீசல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '7.5 ஹெச்பி டீசல் மூலம் இயங்கும் வீடர்'
WHERE id = 'p2' OR name = 'Power Weeder – 7.5 HP Diesel';

UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 7.5 ஹெச்பி டீசல் (செல்ஃப் ஸ்டார்ட்)', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '7.5 ஹெச்பி டீசல் மற்றும் செல்ஃப் ஸ்டார்ட் வசதியுடன்'
WHERE id = 'p3' OR name = 'Power Weeder – 7.5 HP Diesel (Self Start)';

UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 9 ஹெச்பி டீசல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '9 ஹெச்பி டீசல் மூலம் இயங்கும் வலுவான வீடர்'
WHERE id = 'p4' OR name = 'Power Weeder – 9 HP Diesel';

UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 6.5 ஹெச்பி டீசல் (பின்புற ரோட்டவேட்டருடன்)', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '6.5 ஹெச்பி டீசல் வீடர் - பின்புற ரோட்டவேட்டர் இணைக்கப்பட்டது'
WHERE id = 'p5' OR name ILIKE '%Power Weeder - 6.5 HP Diesel with Back Rotavator%';

UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 9 ஹெச்பி (பின்புற ரோட்டவேட்டருடன்)', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '9 ஹெச்பி வீடர் - பின்புற ரோட்டவேட்டர் இணைக்கப்பட்டது'
WHERE id = 'p6' OR name ILIKE '%Power Weeder - 9 HP with Back Rotavator%';

UPDATE products 
SET 
    name_ta = 'பேபி வீடர் – 3.5 ஹெச்பி பெட்ரோல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = 'சிறிய 3.5 ஹெச்பி பெட்ரோல் வீடர்'
WHERE id = 'p7' OR name = 'Baby Weeder – 3.5 HP Petrol';

-- 2. Rotavators (p8-p15)
UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் – 42 பிளேடு மல்டி கியர்', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = '42 பிளேடு மல்டி கியர் ரோட்டவேட்டர்'
WHERE id = 'p8' OR name = 'Rotavator – 42 Blade Multi Gear';

UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் – 42 பிளேடு சிங்கிள் கியர்', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = '42 பிளேடு சிங்கிள் கியர் ரோட்டவேட்டர்'
WHERE id = 'p9' OR name = 'Rotavator – 42 Blade Single Gear';

UPDATE products 
SET 
    name_ta = 'கேப்பிட்டல் பிளஸ் ரோட்டவேட்டர் – 36 பிளேடு மல்டி கியர்', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் பிளஸ் 36 பிளேடு மல்டி கியர்'
WHERE id = 'p10' OR name = 'Capital Plus Rotavator – 36 Blade Multi Gear';

UPDATE products 
SET 
    name_ta = 'கேப்டன் ரோட்டவேட்டர் – 36 பிளேடு சிங்கிள் கியர்', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்டன் சீரிஸ் 36 பிளேடு சிங்கிள் கியர்'
WHERE id = 'p11' OR name = 'Captain Rotavator – 36 Blade Single Gear';

UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் கேப்பிட்டல் – 42 பிளேடு (மாடல் A)', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் 42 பிளேடு மாடல் A'
WHERE id = 'p12' OR name = 'Rotavator Capital – 42 Blade (Model A)';

UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் கேப்பிட்டல் – 42 பிளேடு (மாடல் B)', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் 42 பிளேடு மாடல் B'
WHERE id = 'p13' OR name = 'Rotavator Capital – 42 Blade (Model B)';

UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் கேப்பிட்டல் – 36 பிளேடு (மாடல் A)', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் 36 பிளேடு மாடல் A'
WHERE id = 'p14' OR name = 'Rotavator Capital – 36 Blade (Model A)';

UPDATE products 
SET 
    name_ta = 'ரோட்டவேட்டர் கேப்பிட்டல் – 36 பிளேடு (மாடல் B)', 
    category_ta = 'ரோட்டவேட்டர்கள்',
    short_description_ta = 'கேப்பிட்டல் 36 பிளேடு மாடல் B'
WHERE id = 'p15' OR name = 'Rotavator Capital – 36 Blade (Model B)';

-- 3. Cutters (Chaff Cutters) (p16-p19)
UPDATE products 
SET 
    name_ta = 'சாப் கட்டர் - மாடல் 1 (கியர் இல்லாமல்)', 
    category_ta = 'கட்டர்கள்',
    short_description_ta = 'கியர் வசதி இல்லாத மாடல் 1'
WHERE id = 'p16' OR name = 'Chop Cutter – Model 1 (Without Gear)';

UPDATE products 
SET 
    name_ta = 'சாப் கட்டர் - மாடல் 2 (கியருடன்)', 
    category_ta = 'கட்டர்கள்',
    short_description_ta = 'கியர் வசதி கொண்ட மாடல் 2'
WHERE id = 'p17' OR name = 'Chop Cutter – Model 2 (With Gear)';

UPDATE products 
SET 
    name_ta = 'சாப் கட்டர் - எலைட் மாடல் (5 பிளேடு)', 
    category_ta = 'கட்டர்கள்',
    short_description_ta = '5 பிளேடு அமைப்புடன் கூடிய எலைட் மாடல்'
WHERE id = 'p18' OR name = 'Chop Cutter – Elite Model (5 Blade)';

UPDATE products 
SET 
    name_ta = 'சாப் கட்டர் - பிரீமியம் மாடல்', 
    category_ta = 'கட்டர்கள்',
    short_description_ta = 'உயர்தர பிரீமியம் சாப் கட்டர்'
WHERE id = 'p19' OR name = 'Chop Cutter – Premium Model';

-- 4. Dairy Equipment (Milking Machines) (p20-p23)
UPDATE products 
SET 
    name_ta = 'கறவை இயந்திரம் - நானோ மாடல்', 
    category_ta = 'பால் பண்ணை உபகரணங்கள்',
    short_description_ta = 'சிறிய நானோ கறவை இயந்திரம்'
WHERE id = 'p20' OR name = 'Milking Machine – Nano Model';

UPDATE products 
SET 
    name_ta = 'கறவை இயந்திரம் - சூப்பர் நானோ மாடல்', 
    category_ta = 'பால் பண்ணை உபகரணங்கள்',
    short_description_ta = 'மேம்படுத்தப்பட்ட சூப்பர் நானோ மாடல்'
WHERE id = 'p21' OR name = 'Milking Machine – Super Nano Model';

UPDATE products 
SET 
    name_ta = 'கறவை இயந்திரம் - ஒற்றை பக்கெட் மாடல்', 
    category_ta = 'பால் பண்ணை உபகரணங்கள்',
    short_description_ta = 'கம்ப்ரஸர் கொண்ட ஒற்றை பக்கெட் மாடல்'
WHERE id = 'p22' OR name = 'Milking Machine – Single Bucket Model';

UPDATE products 
SET 
    name_ta = 'கறவை இயந்திரம் - டைமண்ட் மாடல்', 
    category_ta = 'பால் பண்ணை உபகரணங்கள்',
    short_description_ta = 'பிரீமியம் டைமண்ட் மாடல்'
WHERE id = 'p23' OR name = 'Milking Machine – Diamond Model';

-- 5. General Cleanup for any future categories
UPDATE products SET category_ta = 'ரோட்டவேட்டர்கள்' WHERE category = 'Rotavators' AND category_ta IS NULL;
UPDATE products SET category_ta = 'கட்டர்கள்' WHERE category = 'Cutters' AND category_ta IS NULL;
UPDATE products SET category_ta = 'களை எடுக்கும் இயந்திரம்' WHERE category = 'Weeders' AND category_ta IS NULL;
UPDATE products SET category_ta = 'பால் பண்ணை உபகரணங்கள்' WHERE category = 'Dairy Equipment' AND category_ta IS NULL;
