-- Migration to add password column to staff_users
ALTER TABLE staff_users ADD COLUMN password TEXT;
