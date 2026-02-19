CREATE TABLE IF NOT EXISTS purchase_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  po_number VARCHAR(50) UNIQUE,
  pr_id BIGINT NOT NULL,
  status VARCHAR(30),
  base_amount DECIMAL(15,2),
  gst_percent DECIMAL(5,2),
  gst_amount DECIMAL(15,2),
  total_amount DECIMAL(15,2),
  total_quantity INT,
  delivered_quantity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


