const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS family_data (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS photos (
    id   TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
`);

module.exports = db;
