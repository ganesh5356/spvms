-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS alter_vendor_v13;

DELIMITER //

CREATE PROCEDURE alter_vendor_v13()
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendors' AND COLUMN_NAME = 'user_id' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE vendors ADD COLUMN user_id BIGINT UNIQUE;
    END IF;

    -- Add foreign key constraint if it doesn't exist
    -- Note: Checking INFORMATION_SCHEMA.KEY_COLUMN_USAGE for the specific constraint name
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'vendors' AND CONSTRAINT_NAME = 'fk_vendor_user' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE vendors ADD CONSTRAINT fk_vendor_user FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL alter_vendor_v13();

-- Cleanup
DROP PROCEDURE IF EXISTS alter_vendor_v13;
