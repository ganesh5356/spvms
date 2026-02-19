-- Migration: Add CGST, SGST, IGST fields to purchase_orders table
-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS alter_po_v12;

DELIMITER //

CREATE PROCEDURE alter_po_v12()
BEGIN
    -- Drop gst_percent if exists
    IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'gst_percent' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_orders DROP COLUMN gst_percent;
    END IF;

    -- Drop gst_amount if exists
    IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'gst_amount' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE purchase_orders DROP COLUMN gst_amount;
    END IF;

    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'cgst_percent' AND TABLE_SCHEMA = DATABASE()) THEN
        ALTER TABLE purchase_orders ADD COLUMN cgst_percent DECIMAL(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'sgst_percent' AND TABLE_SCHEMA = DATABASE()) THEN
        ALTER TABLE purchase_orders ADD COLUMN sgst_percent DECIMAL(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'igst_percent' AND TABLE_SCHEMA = DATABASE()) THEN
        ALTER TABLE purchase_orders ADD COLUMN igst_percent DECIMAL(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'cgst_amount' AND TABLE_SCHEMA = DATABASE()) THEN
        ALTER TABLE purchase_orders ADD COLUMN cgst_amount DECIMAL(15, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'sgst_amount' AND TABLE_SCHEMA = DATABASE()) THEN
        ALTER TABLE purchase_orders ADD COLUMN sgst_amount DECIMAL(15, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'igst_amount' AND TABLE_SCHEMA = DATABASE()) THEN
        ALTER TABLE purchase_orders ADD COLUMN igst_amount DECIMAL(15, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'total_gst_amount' AND TABLE_SCHEMA = DATABASE()) THEN
        ALTER TABLE purchase_orders ADD COLUMN total_gst_amount DECIMAL(15, 2);
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL alter_po_v12();

-- Cleanup
DROP PROCEDURE IF EXISTS alter_po_v12;
