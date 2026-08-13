-- =============================================================================
-- Sellora Backend — Combined Migration
-- Covers: Fix 3 (product_images), Fix 4 (shipping address), Fix 5 (Razorpay),
--         Fix 6 (cart unique constraint)
--
-- This script uses idempotent procedures (safe to re-run multiple times).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Fix 3: Product Images table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    INT NOT NULL,
  image_url     VARCHAR(2048) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Migrate existing image_url data from products into the new table
-- We use IGNORE so this is idempotent if run multiple times.
INSERT IGNORE INTO product_images (product_id, image_url, display_order)
SELECT id, image_url, 0
FROM products
WHERE image_url IS NOT NULL AND image_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_images.product_id = products.id
  );

-- ---------------------------------------------------------------------------
-- Idempotent helper procedures for columns and indexes
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DROP PROCEDURE IF EXISTS AddIndexIfNotExists;

DELIMITER //

CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(255),
    IN columnName VARCHAR(255),
    IN columnDefinition TEXT
)
BEGIN
    SET @dbname = DATABASE();
    SET @columnExists = (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
          AND TABLE_NAME = tableName
          AND COLUMN_NAME = columnName
    );
    IF @columnExists = 0 THEN
        SET @alterSql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDefinition);
        PREPARE stmt FROM @alterSql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

CREATE PROCEDURE AddIndexIfNotExists(
    IN tableName VARCHAR(255),
    IN indexName VARCHAR(255),
    IN indexDefinition TEXT
)
BEGIN
    SET @dbname = DATABASE();
    SET @indexExists = (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
          AND TABLE_NAME = tableName
          AND INDEX_NAME = indexName
    );
    IF @indexExists = 0 THEN
        SET @alterSql = CONCAT('ALTER TABLE ', tableName, ' ADD ', indexDefinition);
        PREPARE stmt FROM @alterSql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

-- ---------------------------------------------------------------------------
-- Fix 4: Shipping / delivery address columns on orders
-- NOTE: The NOT NULL DEFAULT '' defaults exist only to keep this migration
-- non-breaking for rows created before this change. They are NOT a substitute
-- for application-level validation.
-- ---------------------------------------------------------------------------
CALL AddColumnIfNotExists('orders', 'shipping_name', 'VARCHAR(100) NOT NULL DEFAULT \'\' AFTER total_amount');
CALL AddColumnIfNotExists('orders', 'shipping_address', 'VARCHAR(500) NOT NULL DEFAULT \'\' AFTER shipping_name');
CALL AddColumnIfNotExists('orders', 'shipping_city', 'VARCHAR(100) NOT NULL DEFAULT \'\' AFTER shipping_address');
CALL AddColumnIfNotExists('orders', 'shipping_state', 'VARCHAR(100) NOT NULL DEFAULT \'\' AFTER shipping_city');
CALL AddColumnIfNotExists('orders', 'shipping_pincode', 'VARCHAR(10) NOT NULL DEFAULT \'\' AFTER shipping_state');
CALL AddColumnIfNotExists('orders', 'shipping_phone', 'VARCHAR(15) NOT NULL DEFAULT \'\' AFTER shipping_pincode');

-- ---------------------------------------------------------------------------
-- Fix 5: Razorpay payment columns on orders
-- ---------------------------------------------------------------------------
CALL AddColumnIfNotExists('orders', 'razorpay_order_id', 'VARCHAR(100) DEFAULT NULL AFTER status');
CALL AddColumnIfNotExists('orders', 'razorpay_payment_id', 'VARCHAR(100) DEFAULT NULL AFTER razorpay_order_id');
CALL AddColumnIfNotExists('orders', 'payment_status', 'ENUM(\'PENDING\',\'PAID\',\'FAILED\') DEFAULT \'PENDING\' AFTER razorpay_payment_id');

-- ---------------------------------------------------------------------------
-- Fix 6: Unique constraint on cart (user_id, product_id)
-- ---------------------------------------------------------------------------
CALL AddIndexIfNotExists('cart', 'uq_cart_user_product', 'UNIQUE INDEX uq_cart_user_product (user_id, product_id)');

-- ---------------------------------------------------------------------------
-- Performance: Ensure indexes exist for the seller-orders join (Fix 2)
-- ---------------------------------------------------------------------------
CALL AddIndexIfNotExists('seller_profiles', 'idx_seller_profiles_user_id', 'INDEX idx_seller_profiles_user_id (user_id)');
CALL AddIndexIfNotExists('products', 'idx_products_seller_id', 'INDEX idx_products_seller_id (seller_id)');

-- Cleanup helper procedures
DROP PROCEDURE AddColumnIfNotExists;
DROP PROCEDURE AddIndexIfNotExists;
