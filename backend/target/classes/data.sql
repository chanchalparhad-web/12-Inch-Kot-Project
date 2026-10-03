-- SEED DATA FOR 12 INCH FRIES - BILLPRO POS
-- Business Setup: 12 Inch Fries

INSERT INTO businesses (id, name, owner_name, mobile, email, address, city, state, pincode, gst_enabled, gstin, invoice_prefix)
VALUES (1, '12 Inch Fries', 'Ganesh Shinde', '9876543210', 'contact@the12inchfries.com', 'Kharadi', 'Pune', 'Maharashtra', '411014', TRUE, '27AABCU9603R1ZM', 'INF')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, owner_name = EXCLUDED.owner_name, address = EXCLUDED.address, city = EXCLUDED.city;

INSERT INTO users (id, name, email, mobile, password, role, business_id)
VALUES (1, 'Ganesh Shinde', 'ganesh@the12inchfries.com', '9876543210', '$2a$10$e8w8S5...hashed_password', 'OWNER', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- CATEGORIES
INSERT INTO categories (id, business_id, name) VALUES
(1, 1, 'Signature Fries'),
(2, 1, 'House Special'),
(3, 1, 'Build Your Own'),
(4, 1, 'Add-Ons')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- PRODUCTS (12 INCH FRIES MENU)
INSERT INTO products (id, business_id, category_id, name, sku, barcode, purchase_price, selling_price, gst_percentage, unit, low_stock_threshold, active) VALUES
(1, 1, 1, 'The Original 12', 'SF-01', '12F-001', 40.00, 99.00, 5.00, 'pcs', 10, TRUE),
(2, 1, 1, 'Smoky Storm', 'SF-02', '12F-002', 45.00, 109.00, 5.00, 'pcs', 10, TRUE),
(3, 1, 1, 'New York Crunch', 'SF-03', '12F-003', 45.00, 109.00, 5.00, 'pcs', 10, TRUE),
(4, 1, 1, 'BBQ Burner', 'SF-04', '12F-004', 45.00, 109.00, 5.00, 'pcs', 10, TRUE),
(5, 1, 1, 'Chipotle Kick', 'SF-05', '12F-005', 50.00, 119.00, 5.00, 'pcs', 10, TRUE),
(6, 1, 1, 'Cheese Blast', 'SF-06', '12F-006', 50.00, 119.00, 5.00, 'pcs', 10, TRUE),
(7, 1, 1, 'Jalapeño Melt', 'SF-07', '12F-007', 55.00, 129.00, 5.00, 'pcs', 10, TRUE),
(8, 1, 1, 'Garlic Crush', 'SF-08', '12F-008', 45.00, 109.00, 5.00, 'pcs', 10, TRUE),
(9, 1, 1, 'Mint Fire', 'SF-09', '12F-009', 45.00, 109.00, 5.00, 'pcs', 10, TRUE),
(10, 1, 1, 'Smoky Melt', 'SF-10', '12F-010', 55.00, 129.00, 5.00, 'pcs', 10, TRUE),
(11, 1, 1, 'Chipotle Meltdown', 'SF-11', '12F-011', 55.00, 129.00, 5.00, 'pcs', 10, TRUE),
(12, 1, 2, '12 Inch Signature', 'HS-12', '12F-012', 65.00, 149.00, 5.00, 'pcs', 10, TRUE),
(13, 1, 3, 'Build Your Own 12"', 'BYO-13', '12F-013', 50.00, 119.00, 5.00, 'pcs', 10, TRUE),
(14, 1, 4, 'Jalapeño Add-On', 'AO-14', '12F-014', 8.00, 20.00, 5.00, 'pcs', 10, TRUE),
(15, 1, 4, 'Extra Cheese Add-On', 'AO-15', '12F-015', 12.00, 30.00, 5.00, 'pcs', 10, TRUE),
(16, 1, 4, 'Extra Sauce Add-On', 'AO-16', '12F-016', 5.00, 15.00, 5.00, 'pcs', 10, TRUE)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    selling_price = EXCLUDED.selling_price, 
    category_id = EXCLUDED.category_id, 
    active = TRUE;

-- -- INVENTORY INITIAL STOCK
-- INSERT INTO inventory (id, product_id, current_stock) VALUES
-- (1, 1, 50),
-- (2, 2, 50),
-- (3, 3, 50),
-- (4, 4, 50),
-- (5, 5, 50),
-- (6, 6, 50),
-- (7, 7, 50),
-- (8, 8, 50),
-- (9, 9, 50),
-- (10, 10, 50),
-- (11, 11, 50),
-- (12, 12, 50),
-- (13, 13, 50),
-- (14, 14, 100),
-- (15, 15, 100),
-- (16, 16, 100)
-- ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock;

-- -- SAMPLE CUSTOMERS
-- INSERT INTO customers (id, business_id, name, mobile, email, address, gstin) VALUES
-- (1, 1, 'Anish Kumar', '9811223344', 'anish@gmail.com', 'Kharadi, Pune', '27BCCP1234F1Z1'),
-- (2, 1, 'Priya Patel', '9722334455', 'priya@yahoo.com', 'Viman Nagar, Pune', NULL)
-- ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- PRINTER CONFIG
INSERT INTO printers (id, business_id, name, address, connection_type, paper_width, status) VALUES
(1, 1, 'SHREYANS SRS588', '00:11:22:33:44:55', 'BLUETOOTH', 58, 'DISCONNECTED')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
