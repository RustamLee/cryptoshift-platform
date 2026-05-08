-- V2__add_payment_method_to_orders.sql
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20);

