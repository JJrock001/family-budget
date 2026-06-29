const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT data FROM photos WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json(null);
  res.json({ data: row.data });
});

router.post('/:id', (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'No data' });
  db.prepare('INSERT OR REPLACE INTO photos (id, data) VALUES (?, ?)').run(req.params.id, data);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM photos').run();
  res.json({ ok: true });
});

module.exports = router;
