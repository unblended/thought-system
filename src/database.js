/**
 * Database Module
 * 
 * SQLite database with migration system.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor(options = {}) {
    this.dbPath = options.dbPath || this._getDefaultDbPath();
    this.migrationsDir = options.migrationsDir || path.join(__dirname, '..', 'migrations');
  }

  _getDefaultDbPath() {
    const dataDir = path.join(process.env.HOME, '.thought-system');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, 'data.db');
  }

  async getConnection() {
    return new sqlite3.Database(this.dbPath);
  }

  async migrate() {
    const db = await this.getConnection();
    
    try {
      // Create migrations table
      await this._run(db, `
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT UNIQUE NOT NULL,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get applied migrations
      const applied = await this._all(db, 'SELECT filename FROM migrations ORDER BY id');
      const appliedSet = new Set(applied.map(row => row.filename));

      // Find and run pending migrations
      if (!fs.existsSync(this.migrationsDir)) {
        console.log('No migrations directory found');
        return;
      }

      const files = fs.readdirSync(this.migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        if (!appliedSet.has(file)) {
          console.log(`Running migration: ${file}`);
          const sql = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');
          
          await this._run(db, sql);
          await this._run(db, 'INSERT INTO migrations (filename) VALUES (?)', [file]);
          console.log(`✓ Migration ${file} applied`);
        }
      }

      console.log('Database migrations complete');
    } finally {
      db.close();
    }
  }

  async query(sql, params = []) {
    const db = await this.getConnection();
    try {
      return await this._all(db, sql, params);
    } finally {
      db.close();
    }
  }

  async run(sql, params = []) {
    const db = await this.getConnection();
    try {
      return await this._run(db, sql, params);
    } finally {
      db.close();
    }
  }

  _run(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  _all(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = { Database };
