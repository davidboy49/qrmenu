-- Lets admins hide the public menu's carousel of banner photos without removing its images.
ALTER TABLE restaurants ADD COLUMN show_carousel INTEGER NOT NULL DEFAULT 1 CHECK (show_carousel IN (0, 1));
