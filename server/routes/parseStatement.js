const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');

router.post('/', async (req, res) => {
  const { fileData } = req.body;
  if (!fileData) return res.status(400).json({ error: 'No file data' });
  try {
    const buffer = Buffer.from(fileData, 'base64');
    const data = await pdfParse(buffer);
    res.json({ text: data.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
