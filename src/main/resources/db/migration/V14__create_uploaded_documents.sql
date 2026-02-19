-- Create uploaded_documents table
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  data LONGBLOB NOT NULL,
  upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Safely update role_selection_requests using a procedure
DROP PROCEDURE IF EXISTS migrate_role_requests;
DELIMITER //
CREATE PROCEDURE migrate_role_requests()
BEGIN
    -- Add document_id if it doesn't exist (Hibernate might have already added it)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'role_selection_requests' 
        AND COLUMN_NAME = 'document_id'
    ) THEN
        ALTER TABLE role_selection_requests ADD COLUMN document_id BIGINT;
    END IF;

    -- Add constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'role_selection_requests' 
        AND CONSTRAINT_NAME = 'fk_role_request_document'
    ) THEN
        ALTER TABLE role_selection_requests ADD CONSTRAINT fk_role_request_document 
        FOREIGN KEY (document_id) REFERENCES uploaded_documents(id);
    END IF;

    -- Drop document_path if it still exists (Hibernate never drops columns)
    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'role_selection_requests' 
        AND COLUMN_NAME = 'document_path'
    ) THEN
        ALTER TABLE role_selection_requests DROP COLUMN document_path;
    END IF;
END //
DELIMITER ;

CALL migrate_role_requests();
DROP PROCEDURE migrate_role_requests;
