-- Seed Branches
INSERT INTO branches (id, name, location, contact_number, active) VALUES
('b1', 'Attrupalam Branch', 'Attrupalam, Tamil Nadu', '9876543210', true),
('b2', 'Periamuthu Branch', 'Periamuthu, Tamil Nadu', '9876543211', true),
('b3', 'Tirupathur Branch', 'Tirupathur, Tamil Nadu', '9876543212', true),
('b4', 'Hosur Branch', 'Hosur, Tamil Nadu', '9876543213', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Users
INSERT INTO users (id, username, password, role, name, branch_id) VALUES
('u1', 'admin', 'password', 'admin', 'System Admin', NULL),
('u2', 'caller1', 'password', 'telecaller', 'Meena (Caller)', NULL),
('u3', 'caller2', 'password', 'telecaller', 'Rajesh (Caller)', NULL),
('u4', 'admin_attrupalam', 'password', 'branch_admin', 'Attrupalam Admin', 'b1'),
('u5', 'admin_periamuthu', 'password', 'branch_admin', 'Periamuthu Admin', 'b2'),
('u6', 'admin_tirupathur', 'password', 'branch_admin', 'Tirupathur Admin', 'b3'),
('u7', 'admin_hosur', 'password', 'branch_admin', 'Hosur Admin', 'b4')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, sku, name, category, short_description, price_range, active) VALUES
('p1', 'PW-P-075', 'Power Weeder – 7.5 HP Petrol', 'Weeders', '7.5 HP Petrol powered weeder', '₹45,000 - ₹55,000', true),
('p2', 'PW-D-075', 'Power Weeder – 7.5 HP Diesel', 'Weeders', '7.5 HP Diesel powered weeder', '₹48,000 - ₹58,000', true),
('p3', 'PW-D-075S', 'Power Weeder – 7.5 HP Diesel (Self Start)', 'Weeders', '7.5 HP Diesel with self-start feature', '₹52,000 - ₹62,000', true),
('p4', 'PW-D-090', 'Power Weeder – 9 HP Diesel', 'Weeders', '9 HP Diesel powered weeder', '₹55,000 - ₹65,000', true),
('p5', 'PW-BR-065', 'Power Weeder – 6.5 HP Diesel with Back Rotavator', 'Weeders', '6.5 HP with back rotavator attachment', '₹58,000 - ₹68,000', true),
('p6', 'PW-BR-090', 'Power Weeder – 9 HP with Back Rotavator', 'Weeders', '9 HP with back rotavator attachment', '₹62,000 - ₹72,000', true),
('p7', 'BW-P-035', 'Baby Weeder – 3.5 HP Petrol', 'Weeders', 'Compact 3.5 HP petrol weeder', '₹25,000 - ₹32,000', true),
('p8', 'RT-42-MG', 'Rotavator – 42 Blade Multi Gear', 'Rotavators', '42 blade multi-gear rotavator', '₹35,000 - ₹45,000', true),
('p9', 'RT-42-SG', 'Rotavator – 42 Blade Single Gear', 'Rotavators', '42 blade single gear rotavator', '₹32,000 - ₹42,000', true),
('p10', 'RT-CP-36-MG', 'Capital Plus Rotavator – 36 Blade Multi Gear', 'Rotavators', 'Capital Plus 36 blade multi-gear', '₹38,000 - ₹48,000', true),
('p11', 'RT-CT-36-SG', 'Captain Rotavator – 36 Blade Single Gear', 'Rotavators', 'Captain series 36 blade single gear', '₹36,000 - ₹45,000', true),
('p12', 'RT-CAP-42-A', 'Rotavator Capital – 42 Blade (Model A)', 'Rotavators', 'Capital 42 blade Model A', '₹40,000 - ₹50,000', true),
('p13', 'RT-CAP-42-B', 'Rotavator Capital – 42 Blade (Model B)', 'Rotavators', 'Capital 42 blade Model B', '₹42,000 - ₹52,000', true),
('p14', 'RT-CAP-36-A', 'Rotavator Capital – 36 Blade (Model A)', 'Rotavators', 'Capital 36 blade Model A', '₹37,000 - ₹47,000', true),
('p15', 'RT-CAP-36-B', 'Rotavator Capital – 36 Blade (Model B)', 'Rotavators', 'Capital 36 blade Model B', '₹39,000 - ₹49,000', true),
('p16', 'CC-01-NG', 'Chop Cutter – Model 1 (Without Gear)', 'Cutters', 'Model 1 without gear mechanism', '₹8,000 - ₹12,000', true),
('p17', 'CC-02-WG', 'Chop Cutter – Model 2 (With Gear)', 'Cutters', 'Model 2 with gear mechanism', '₹12,000 - ₹16,000', true),
('p18', 'CC-EL-05B', 'Chop Cutter – Elite Model (5 Blade)', 'Cutters', 'Elite model with 5 blade system', '₹15,000 - ₹20,000', true),
('p19', 'CC-PR', 'Chop Cutter – Premium Model', 'Cutters', 'Premium chop cutter model', '₹18,000 - ₹24,000', true),
('p20', 'MM-NANO', 'Milking Machine – Nano Model', 'Dairy Equipment', 'Compact Nano milking machine', '₹22,000 - ₹28,000', true),
('p21', 'MM-SNANO', 'Milking Machine – Super Nano Model', 'Dairy Equipment', 'Enhanced Super Nano model', '₹28,000 - ₹35,000', true),
('p22', 'MM-SB', 'Milking Machine – Single Bucket Model', 'Dairy Equipment', 'Compressor-based single bucket', '₹30,000 - ₹38,000', true),
('p23', 'MM-DM', 'Milking Machine – Diamond Model', 'Dairy Equipment', 'Premium Diamond model', '₹35,000 - ₹45,000', true)
ON CONFLICT (id) DO NOTHING;
