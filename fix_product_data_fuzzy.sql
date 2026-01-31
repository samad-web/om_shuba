-- Fuzzy Match Product Localization
-- Uses wildcards (%) to skip over potential special characters like en-dashes (–) vs hyphens (-)

-- 1. Chop Cutters
UPDATE products 
SET 
    name_ta = 'சாப் கட்டர் - பிரீமியம் மாடல்', 
    category_ta = 'கட்டர்கள்',
    short_description_ta = 'பிரீமியம் சாப் கட்டர் மாடல்'
WHERE name ILIKE '%Chop Cutter%Premium%';

UPDATE products 
SET 
    name_ta = 'சாப் கட்டர் - மாடல் 1 (கியர் இல்லாமல்)', 
    category_ta = 'கட்டர்கள்',
    short_description_ta = 'கியர் வழிமுறை இல்லாமல் மாடல் 1'
WHERE name ILIKE '%Chop Cutter%Model 1%';

UPDATE products 
SET 
    name_ta = 'சாப் கட்டர் - மாடல் 2 (கியருடன்)', 
    category_ta = 'கட்டர்கள்',
    short_description_ta = 'கியர் பொறிமுறையுடன் மாடல் 2'
WHERE name ILIKE '%Chop Cutter%Model 2%';

UPDATE products 
SET 
    name_ta = 'சாப் கட்டர் - எலைட் மாடல்', 
    category_ta = 'கட்டர்கள்',
    short_description_ta = '5 பிளேடு அமைப்புடன் கூடிய எலைட் மாடல்'
WHERE name ILIKE '%Chop Cutter%Elite%';

-- 2. Power Weeders
UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 7.5 ஹெச்பி பெட்ரோல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '7.5 ஹெச்பி பெட்ரோல் மூலம் இயங்கும் வீடர்'
WHERE name ILIKE '%Power Weeder%7.5 HP Petrol%';

UPDATE products 
SET 
    name_ta = 'பவர் வீடர் – 7.5 ஹெச்பி டீசல்', 
    category_ta = 'களை எடுக்கும் இயந்திரம்',
    short_description_ta = '7.5 ஹெச்பி டீசல் மூலம் இயங்கும் வீடர்'
WHERE name ILIKE '%Power Weeder%7.5 HP Diesel%';

-- 3. Milking Machines
UPDATE products 
SET 
    name_ta = 'கறவை இயந்திரம் - ஒற்றை பக்கெட்', 
    category_ta = 'பால் பண்ணை உபகரணங்கள்',
    short_description_ta = 'சிறிய பண்ணைகளுக்கான ஒற்றை பக்கெட் அமைப்பு'
WHERE name ILIKE '%Milking Machine%Single%';

UPDATE products 
SET 
    name_ta = 'கறவை இயந்திரம் - இரட்டை பக்கெட்', 
    category_ta = 'பால் பண்ணை உபகரணங்கள்',
    short_description_ta = 'பெரிய பண்ணைகளுக்கான இரட்டை பக்கெட் அமைப்பு'
WHERE name ILIKE '%Milking Machine%Double%';

-- 4. General Category Fallbacks for any remaining items
UPDATE products SET category_ta = 'கட்டர்கள்' WHERE category ILIKE '%Cutter%' AND category_ta IS NULL;
UPDATE products SET category_ta = 'களை எடுக்கும் இயந்திரம்' WHERE category ILIKE '%Weeder%' AND category_ta IS NULL;
UPDATE products SET category_ta = 'பால் பண்ணை உபகரணங்கள்' WHERE category ILIKE '%Dairy%' AND category_ta IS NULL;
