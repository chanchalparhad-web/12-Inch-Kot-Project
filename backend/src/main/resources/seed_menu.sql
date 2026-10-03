TRUNCATE TABLE sale_items, sales, inventory, products, categories CASCADE;

INSERT INTO categories (id, business_id, name) VALUES 
(1, 1, 'Signature Fries'), 
(2, 1, 'House Special'), 
(3, 1, 'Build Your Own'), 
(4, 1, 'Add-Ons');

INSERT INTO products (id, business_id, category_id, name, sku, barcode, purchase_price, selling_price, unit, low_stock_threshold, active) VALUES 
(1, 1, 1, 'The Original 12', 'SF-01', '12F-001', 40.00, 99.00, 'pcs', 10, TRUE),
(2, 1, 1, 'Smoky Storm', 'SF-02', '12F-002', 45.00, 109.00, 'pcs', 10, TRUE),
(3, 1, 1, 'New York Crunch', 'SF-03', '12F-003', 45.00, 109.00, 'pcs', 10, TRUE),
(4, 1, 1, 'BBQ Burner', 'SF-04', '12F-004', 45.00, 109.00, 'pcs', 10, TRUE),
(5, 1, 1, 'Chipotle Kick', 'SF-05', '12F-005', 50.00, 119.00, 'pcs', 10, TRUE),
(6, 1, 1, 'Cheese Blast', 'SF-06', '12F-006', 50.00, 119.00, 'pcs', 10, TRUE),
(7, 1, 1, 'Jalapeno Melt', 'SF-07', '12F-007', 55.00, 129.00, 'pcs', 10, TRUE),
(8, 1, 1, 'Garlic Crush', 'SF-08', '12F-008', 45.00, 109.00, 'pcs', 10, TRUE),
(9, 1, 1, 'Mint Fire', 'SF-09', '12F-009', 45.00, 109.00, 'pcs', 10, TRUE),
(10, 1, 1, 'Smoky Melt', 'SF-10', '12F-010', 55.00, 129.00, 'pcs', 10, TRUE),
(11, 1, 1, 'Chipotle Meltdown', 'SF-11', '12F-011', 55.00, 129.00, 'pcs', 10, TRUE),
(12, 1, 2, '12 Inch Signature', 'HS-12', '12F-012', 65.00, 149.00, 'pcs', 10, TRUE),
(13, 1, 3, 'Build Your Own 12"', 'BYO-13', '12F-013', 50.00, 119.00, 'pcs', 10, TRUE),
(14, 1, 4, 'Jalapeno Add-On', 'AO-14', '12F-014', 8.00, 20.00, 'pcs', 10, TRUE),
(15, 1, 4, 'Extra Cheese Add-On', 'AO-15', '12F-015', 12.00, 30.00, 'pcs', 10, TRUE),
(16, 1, 4, 'Extra Sauce Add-On', 'AO-16', '12F-016', 5.00, 15.00, 'pcs', 10, TRUE);

INSERT INTO inventory (product_id, current_stock) VALUES 
(1,50),(2,50),(3,50),(4,50),(5,50),(6,50),(7,50),(8,50),(9,50),(10,50),(11,50),(12,50),(13,50),(14,100),(15,100),(16,100);
