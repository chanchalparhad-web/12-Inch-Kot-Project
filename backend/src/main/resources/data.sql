-- SEED DATA FOR 12 INCH FRIES - BILLPRO POS
-- Business Setup: 12 Inch Fries

INSERT INTO businesses (id, name, owner_name, mobile, email, address, city, state, pincode, invoice_prefix)
VALUES (1, '12 Inch Fries', 'Ganesh Shinde', '9876543210', 'contact@the12inchfries.com', 'Kharadi', 'Pune', 'Maharashtra', '411014', 'INF')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, owner_name = EXCLUDED.owner_name, address = EXCLUDED.address, city = EXCLUDED.city;

-- Admin user (Default login: 9876543210 / password123)
-- BCrypt hashed password for 'password123': $2a$10$dx5wO7q3b2u0zXvRk9b3Xe1s5y0b5v8x7a9n0m1l2k3j4h5g6f7e8
INSERT INTO users (id, name, email, mobile, password, role, business_id)
VALUES (1, 'Ganesh Shinde', 'ganesh@the12inchfries.com', '9876543210', '$2a$10$dx5wO7q3b2u0zXvRk9b3Xe1s5y0b5v8x7a9n0m1l2k3j4h5g6f7e8', 'OWNER', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- CATEGORIES
INSERT INTO categories (id, business_id, name) VALUES
(1, 1, 'Signature Fries'),
(2, 1, 'House Special'),
(3, 1, 'Build Your Own'),
(4, 1, 'Add-Ons')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- PRODUCTS (12 INCH FRIES MENU)
INSERT INTO products (id, business_id, category_id, name, sku, barcode, purchase_price, selling_price, unit, low_stock_threshold, active) VALUES
(1, 1, 1, 'The Original 12', 'SF-01', '12F-001', 40.00, 99.00, 'pcs', 10, TRUE),
(2, 1, 1, 'Smoky Storm', 'SF-02', '12F-002', 45.00, 109.00, 'pcs', 10, TRUE),
(3, 1, 1, 'New York Crunch', 'SF-03', '12F-003', 45.00, 109.00, 'pcs', 10, TRUE),
(4, 1, 1, 'BBQ Burner', 'SF-04', '12F-004', 45.00, 109.00, 'pcs', 10, TRUE),
(5, 1, 1, 'Chipotle Kick', 'SF-05', '12F-005', 50.00, 119.00, 'pcs', 10, TRUE),
(6, 1, 1, 'Cheese Blast', 'SF-06', '12F-006', 50.00, 119.00, 'pcs', 10, TRUE),
(7, 1, 1, 'Jalapeño Melt', 'SF-07', '12F-007', 55.00, 129.00, 'pcs', 10, TRUE),
(8, 1, 1, 'Garlic Crush', 'SF-08', '12F-008', 45.00, 109.00, 'pcs', 10, TRUE),
(9, 1, 1, 'Mint Fire', 'SF-09', '12F-009', 45.00, 109.00, 'pcs', 10, TRUE),
(10, 1, 1, 'Smoky Melt', 'SF-10', '12F-010', 55.00, 129.00, 'pcs', 10, TRUE),
(11, 1, 1, 'Chipotle Meltdown', 'SF-11', '12F-011', 55.00, 129.00, 'pcs', 10, TRUE),
(12, 1, 2, '12 Inch Signature', 'HS-12', '12F-012', 65.00, 149.00, 'pcs', 10, TRUE),
(13, 1, 3, 'Build Your Own 12"', 'BYO-13', '12F-013', 50.00, 119.00, 'pcs', 10, TRUE),
(14, 1, 4, 'Jalapeño Add-On', 'AO-14', '12F-014', 8.00, 20.00, 'pcs', 10, TRUE),
(15, 1, 4, 'Extra Cheese Add-On', 'AO-15', '12F-015', 12.00, 30.00, 'pcs', 10, TRUE),
(16, 1, 4, 'Extra Sauce Add-On', 'AO-16', '12F-016', 5.00, 15.00, 'pcs', 10, TRUE)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    selling_price = EXCLUDED.selling_price, 
    category_id = EXCLUDED.category_id, 
    active = TRUE;

-- PRINTER CONFIG
INSERT INTO printers (id, business_id, name, address, connection_type, paper_width, status) VALUES
(1, 1, 'SHREYANS SRS588', '00:11:22:33:44:55', 'BLUETOOTH', 58, 'DISCONNECTED')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
