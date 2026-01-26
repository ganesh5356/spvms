ALTER TABLE vendors ADD COLUMN user_id BIGINT UNIQUE;
ALTER TABLE vendors ADD CONSTRAINT fk_vendor_user FOREIGN KEY (user_id) REFERENCES users(id);
