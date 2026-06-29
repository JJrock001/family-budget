const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');

router.post('/', async (req, res) => {
  const { fileData, password } = req.body;
  if (!fileData) return res.status(400).json({ error: 'No file data' });
  try {
    const buffer = Buffer.from(fileData, 'base64');
    const options = password ? { password } : {};
    const data = await pdfParse(buffer, options);
    res.json({ text: data.text });
  } catch (e) {
    const msg = e.message || '';
    const isEncrypted = /password|encrypt|protected/i.test(msg);
    res.status(isEncrypted ? 401 : 500).json({ error: msg, encrypted: isEncrypted });
  }
});

module.exports = router;
