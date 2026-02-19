-- Drop the procedure if it exists
DROP PROCEDURE IF EXISTS add_action_at_to_approval_history;

DELIMITER //

CREATE PROCEDURE add_action_at_to_approval_history()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'approval_history' AND COLUMN_NAME = 'action_at' AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE approval_history ADD COLUMN action_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL add_action_at_to_approval_history();

-- Cleanup
DROP PROCEDURE IF EXISTS add_action_at_to_approval_history;
