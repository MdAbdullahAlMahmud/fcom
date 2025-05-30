-- Rename users table to admins
RENAME TABLE users TO admins;

-- Update foreign key references in orders table
ALTER TABLE orders
DROP FOREIGN KEY orders_ibfk_1,
DROP FOREIGN KEY orders_ibfk_2,
DROP FOREIGN KEY orders_ibfk_3;

ALTER TABLE orders
ADD CONSTRAINT orders_user_id_fk FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE,
ADD CONSTRAINT orders_created_by_fk FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT,
ADD CONSTRAINT orders_updated_by_fk FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE RESTRICT; 