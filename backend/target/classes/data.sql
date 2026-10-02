-- SEED DATA FOR BILLPRO DEMO
-- Business Setup: Rahul Traders

INSERT INTO businesses (id, name, owner_name, mobile, email, address, city, state, pincode, gst_enabled, gstin, invoice_prefix)
VALUES (1, 'Rahul Traders', 'Rahul Sharma', '9876543210', 'rahul@rahultraders.com', 'Shop No. 12, Main Market, MG Road', 'Pune', 'Maharashtra', '411001', TRUE, '27AABCU9603R1ZM', 'INV');

INSERT INTO users (id, name, email, mobile, password, role, business_id)
VALUES (1, 'Rahul Sharma', 'rahul@rahultraders.com', '9876543210', '$2a$10$e8w8S5...hashed_password', 'OWNER', 1);

INSERT INTO categories (id, business_id, name) VALUES
(1, 1, 'Fast Food'),
(2, 1, 'Beverages'),
(3, 1, 'Snacks'),
(4, 1, 'Grocery'),
(5, 1, 'Electronics');

INSERT INTO products (id, business_id, category_id, name, sku, barcode, purchase_price, selling_price, gst_percentage, unit, low_stock_threshold, active) VALUES
(1, 1, 1, 'Veg Supreme Burger', 'FD-BRG-01', '890123456701', 45.00, 80.00, 5.00, 'pcs', 10, TRUE),
(2, 1, 1, 'Crispy French Fries', 'FD-FRS-01', '890123456702', 30.00, 70.00, 5.00, 'pcs', 15, TRUE),
(3, 1, 2, 'Cold Coffee 300ml', 'BV-COF-01', '890123456703', 20.00, 60.00, 12.00, 'bot', 8, TRUE),
(4, 1, 2, 'Fresh Lime Soda', 'BV-LMT-01', '890123456704', 15.00, 40.00, 5.00, 'gls', 12, TRUE),
(5, 1, 3, 'Masala Cheese Sandwich', 'SNK-SND-01', '890123456705', 40.00, 90.00, 5.00, 'pcs', 5, TRUE),
(6, 1, 4, 'Basmati Rice 5kg', 'GRC-RCE-05', '890123456706', 380.00, 450.00, 0.00, 'bag', 4, TRUE),
(7, 1, 5, 'USB C Fast Charger 20W', 'ELC-CHG-20', '890123456707', 250.00, 499.00, 18.00, 'pcs', 3, TRUE);

INSERT INTO inventory (id, product_id, current_stock) VALUES
(1, 1, 28),
(2, 2, 45),
(3, 3, 4), -- Low Stock alert trigger
(4, 4, 19),
(5, 5, 2), -- Low stock alert trigger
(6, 6, 8),
(7, 7, 0); -- Out of stock alert trigger

INSERT INTO customers (id, business_id, name, mobile, email, address, gstin) VALUES
(1, 1, 'Anish Kumar', '9811223344', 'anish@gmail.com', 'Kothrud, Pune', '27BCCP1234F1Z1'),
(2, 1, 'Priya Patel', '9722334455', 'priya@yahoo.com', 'Deccan, Pune', NULL),
(3, 1, 'Suresh Mehta', '9933445566', 'suresh@office.com', 'Viman Nagar, Pune', '27AAGCS9988E1Z4');

INSERT INTO sales (id, business_id, customer_id, invoice_number, subtotal, discount, tax, grand_total, payment_status, created_at) VALUES
(1, 1, 1, 'INV-00040', 230.00, 20.00, 12.50, 222.50, 'PAID', NOW() - INTERVAL '2 hours'),
(2, 1, 2, 'INV-00041', 150.00, 0.00, 7.50, 157.50, 'PAID', NOW() - INTERVAL '1 hour'),
(3, 1, NULL, 'INV-00042', 270.00, 20.00, 11.50, 261.50, 'PAID', NOW());

INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, discount, tax, total) VALUES
(1, 1, 'Veg Supreme Burger', 2, 80.00, 20.00, 7.00, 147.00),
(1, 2, 'Crispy French Fries', 1, 70.00, 0.00, 5.50, 75.50),
(2, 5, 'Masala Cheese Sandwich', 1, 90.00, 0.00, 4.50, 94.50),
(2, 3, 'Cold Coffee 300ml', 1, 60.00, 0.00, 3.00, 63.00),
(3, 1, 'Veg Supreme Burger', 2, 80.00, 20.00, 7.00, 147.00),
(3, 2, 'Crispy French Fries', 1, 70.00, 0.00, 3.50, 73.50),
(3, 4, 'Fresh Lime Soda', 1, 40.00, 0.00, 1.00, 41.00);

INSERT INTO payments (sale_id, method, amount, status) VALUES
(1, 'CASH', 222.50, 'COMPLETED'),
(2, 'CARD', 157.50, 'COMPLETED'),
(3, 'UPI', 261.50, 'COMPLETED');

INSERT INTO expenses (id, business_id, category, description, amount, payment_method, expense_date, notes) VALUES
(1, 1, 'Electricity', 'Monthly shop electricity bill', 850.00, 'UPI', CURRENT_DATE, 'MSEB bill paid'),
(2, 1, 'Transport', 'Stock delivery tempo fare', 400.00, 'CASH', CURRENT_DATE, 'Vegetable supply delivery');

INSERT INTO printers (id, business_id, name, address, connection_type, paper_width, status) VALUES
(1, 1, 'SHREYANS SRS588', '00:11:22:33:44:55', 'BLUETOOTH', 58, 'DISCONNECTED');
