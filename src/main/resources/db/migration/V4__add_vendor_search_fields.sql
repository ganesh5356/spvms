-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS add_vendor_search_fields;

DELIMITER //

CREATE PROCEDURE add_vendor_search_fields()
BEGIN
    -- Check and add 'rating'
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendors' AND COLUMN_NAME = 'rating' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE vendors ADD COLUMN rating DOUBLE;
    END IF;

    -- Check and add 'location'
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendors' AND COLUMN_NAME = 'location' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE vendors ADD COLUMN location VARCHAR(150);
    END IF;

    -- Check and add 'category'
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendors' AND COLUMN_NAME = 'category' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE vendors ADD COLUMN category VARCHAR(100);
    END IF;

    -- Check and add 'compliant'
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendors' AND COLUMN_NAME = 'compliant' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE vendors ADD COLUMN compliant BOOLEAN;
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL add_vendor_search_fields();

-- Cleanup
DROP PROCEDURE IF EXISTS add_vendor_search_fields;
