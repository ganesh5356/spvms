-- Drop the procedure if it exists (in case of a partially failed/repaired run)
DROP PROCEDURE IF EXISTS add_description_to_roles;

DELIMITER //

CREATE PROCEDURE add_description_to_roles()
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'roles' 
        AND COLUMN_NAME = 'description' 
        AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE roles ADD COLUMN description VARCHAR(255);
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL add_description_to_roles();

-- Cleanup
DROP PROCEDURE IF EXISTS add_description_to_roles;
