-- Server-side admin sessions. The cookie holds a random token; only its SHA-256 hash is stored,
-- so a database leak does not expose usable sessions.
CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  staff_user_id TEXT REFERENCES staff_users(id) ON DELETE CASCADE,
  super_admin_email TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  CHECK (staff_user_id IS NOT NULL OR super_admin_email IS NOT NULL)
);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX idx_admin_sessions_staff ON admin_sessions(staff_user_id);
