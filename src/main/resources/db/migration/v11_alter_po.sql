-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS alter_po_v11;

DELIMITER //

CREATE PROCEDURE alter_po_v11()
BEGIN
    IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'vendor_id' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_orders DROP COLUMN vendor_id;
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL alter_po_v11();

-- Cleanup
DROP PROCEDURE IF EXISTS alter_po_v11;
