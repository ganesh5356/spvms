-- Migration: Add CGST, SGST, IGST fields to purchase_orders table
ALTER TABLE purchase_orders
DROP COLUMN gst_percent,
DROP COLUMN gst_amount,
ADD COLUMN cgst_percent DECIMAL(10, 2),
ADD COLUMN sgst_percent DECIMAL(10, 2),
ADD COLUMN igst_percent DECIMAL(10, 2),
ADD COLUMN cgst_amount DECIMAL(15, 2),
ADD COLUMN sgst_amount DECIMAL(15, 2),
ADD COLUMN igst_amount DECIMAL(15, 2),
ADD COLUMN total_gst_amount DECIMAL(15, 2);
