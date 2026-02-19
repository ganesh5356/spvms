-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS alter_items_quantity_pr;

DELIMITER //

CREATE PROCEDURE alter_items_quantity_pr()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_requisitions' AND COLUMN_NAME = 'items_json' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_requisitions ADD COLUMN items_json VARCHAR(1000);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_requisitions' AND COLUMN_NAME = 'quantity_json' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_requisitions ADD COLUMN quantity_json VARCHAR(1000);
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL alter_items_quantity_pr();

-- Cleanup
DROP PROCEDURE IF EXISTS alter_items_quantity_pr;
