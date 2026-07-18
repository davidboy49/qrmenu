PRAGMA foreign_keys = ON;

CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Phnom_Penh',
  default_locale TEXT NOT NULL DEFAULT 'km-KH',
  public_menu_revision INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Phnom_Penh',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (restaurant_id, slug)
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE category_translations (
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (category_id, locale)
);

CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  sku TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (restaurant_id, sku)
);

CREATE TABLE menu_item_translations (
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (menu_item_id, locale)
);

CREATE TABLE menu_item_prices (
  id TEXT PRIMARY KEY,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency IN ('KHR', 'USD')),
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (menu_item_id, branch_id, currency)
);

CREATE TABLE menu_schedules (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  priority INTEGER NOT NULL DEFAULT 0,
  valid_from TEXT,
  valid_to TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (valid_from IS NULL OR valid_to IS NULL OR valid_from <= valid_to)
);

CREATE TABLE schedule_windows (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL REFERENCES menu_schedules(id) ON DELETE CASCADE,
  iso_weekday INTEGER NOT NULL CHECK (iso_weekday BETWEEN 1 AND 7),
  start_minute INTEGER NOT NULL CHECK (start_minute BETWEEN 0 AND 1439),
  end_minute INTEGER NOT NULL CHECK (end_minute BETWEEN 0 AND 1439),
  end_day_offset INTEGER NOT NULL DEFAULT 0 CHECK (end_day_offset IN (0, 1)),
  CHECK (end_day_offset = 1 OR start_minute < end_minute)
);

CREATE TABLE schedule_items (
  schedule_id TEXT NOT NULL REFERENCES menu_schedules(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (schedule_id, menu_item_id)
);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  width INTEGER,
  height INTEGER,
  checksum TEXT,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('uploading', 'ready', 'failed', 'archived')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE menu_item_media (
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  media_asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text_en TEXT,
  alt_text_km TEXT,
  PRIMARY KEY (menu_item_id, media_asset_id)
);

CREATE TABLE item_availability (
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'available' CHECK (state IN ('available', 'sold_out')),
  expires_at INTEGER,
  updated_by TEXT,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (menu_item_id, branch_id)
);

CREATE INDEX idx_branches_restaurant_status ON branches (restaurant_id, status);
CREATE INDEX idx_categories_restaurant_status_order ON categories (restaurant_id, status, display_order);
CREATE INDEX idx_menu_items_restaurant_status_category ON menu_items (restaurant_id, status, category_id);
CREATE INDEX idx_menu_items_category_order ON menu_items (category_id, display_order);
CREATE INDEX idx_prices_item_branch ON menu_item_prices (menu_item_id, branch_id);
CREATE UNIQUE INDEX idx_prices_item_default_currency ON menu_item_prices (menu_item_id, currency) WHERE branch_id IS NULL;
CREATE INDEX idx_schedules_restaurant_branch_status ON menu_schedules (restaurant_id, branch_id, status);
CREATE INDEX idx_schedule_windows_schedule_day ON schedule_windows (schedule_id, iso_weekday);
CREATE INDEX idx_schedule_items_item ON schedule_items (menu_item_id);
CREATE INDEX idx_availability_branch_state ON item_availability (branch_id, state);
