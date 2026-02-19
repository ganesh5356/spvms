-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS alter_po_v10;

DELIMITER //

CREATE PROCEDURE alter_po_v10()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'items_json' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_orders ADD COLUMN items_json VARCHAR(1000);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'quantity_json' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_orders ADD COLUMN quantity_json VARCHAR(1000);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'total_quantity' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_orders ADD COLUMN total_quantity INT;
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL alter_po_v10();

-- Cleanup
DROP PROCEDURE IF EXISTS alter_po_v10;