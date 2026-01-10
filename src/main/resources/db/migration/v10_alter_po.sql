ALTER TABLE purchase_orders
ADD COLUMN items_json VARCHAR(1000),
ADD COLUMN quantity_json VARCHAR(1000),
ADD COLUMN total_quantity INT;