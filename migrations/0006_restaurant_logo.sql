ALTER TABLE restaurants ADD COLUMN logo_asset_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL;
