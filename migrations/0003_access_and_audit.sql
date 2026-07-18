CREATE TABLE staff_users (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','manager','editor','viewer')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','suspended')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (restaurant_id, email)
);
CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_staff_users_restaurant ON staff_users(restaurant_id, status);
CREATE INDEX idx_audit_events_restaurant_time ON audit_events(restaurant_id, created_at DESC);
INSERT INTO staff_users (id, restaurant_id, email, display_name, role, status, created_at, updated_at)
VALUES ('staff-owner', 'rest-demo', 'owner@example.com', 'Sokha Dara', 'owner', 'active', unixepoch(), unixepoch());
