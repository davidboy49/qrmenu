-- Guest Wi-Fi shown on each branch's public menu. Stored in plain text because guests are meant to read it;
-- admins are told to use a guest network.
ALTER TABLE branches ADD COLUMN wifi_enabled INTEGER NOT NULL DEFAULT 0 CHECK (wifi_enabled IN (0, 1));
ALTER TABLE branches ADD COLUMN wifi_ssid TEXT;
ALTER TABLE branches ADD COLUMN wifi_password TEXT;
ALTER TABLE branches ADD COLUMN wifi_security TEXT NOT NULL DEFAULT 'WPA' CHECK (wifi_security IN ('WPA', 'WEP', 'nopass'));
