-- Add search fields to vendors table
ALTER TABLE vendors
  ADD COLUMN rating DOUBLE,
  ADD COLUMN location VARCHAR(150),
  ADD COLUMN category VARCHAR(100),
  ADD COLUMN compliant BOOLEAN;
