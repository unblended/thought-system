-- Initial migration - Create thoughts table

CREATE TABLE IF NOT EXISTS thoughts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'unknown',
  tags TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at);

-- Index for full-text search (if needed later)
CREATE INDEX IF NOT EXISTS idx_thoughts_content ON thoughts(content);
