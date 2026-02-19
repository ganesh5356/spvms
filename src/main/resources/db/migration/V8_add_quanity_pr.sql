-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS add_item_amount_to_pr;

DELIMITER //

CREATE PROCEDURE add_item_amount_to_pr()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_requisitions' AND COLUMN_NAME = 'item_amount_json' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_requisitions ADD COLUMN item_amount_json VARCHAR(1000);
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL add_item_amount_to_pr();

-- Cleanup
DROP PROCEDURE IF EXISTS add_item_amount_to_pr;