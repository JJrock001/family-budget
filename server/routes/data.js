const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const row = db.prepare('SELECT value FROM family_data WHERE key = ?').get('main');
  if (!row) return res.status(404).json(null);
  res.json(JSON.parse(row.value));
});

router.post('/', (req, res) => {
  db.prepare('INSERT OR REPLACE INTO family_data (key, value) VALUES (?, ?)').run('main', JSON.stringify(req.body));
  res.json({ ok: true });
});

module.exports = router;
