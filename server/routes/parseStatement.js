const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function qpdfDecrypt(inputPath, password) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(os.tmpdir(), `decrypted_${Date.now()}.pdf`);
    execFile('qpdf', ['--password=' + password, '--decrypt', inputPath, outputPath], (err) => {
      if (err) return reject(err);
      resolve(outputPath);
    });
  });
}

router.post('/', async (req, res) => {
  const { fileData, password } = req.body;
  if (!fileData) return res.status(400).json({ error: 'No file data' });

  let tmpIn = null;
  let tmpOut = null;
  try {
    const buffer = Buffer.from(fileData, 'base64');

    if (password) {
      tmpIn = path.join(os.tmpdir(), `enc_${Date.now()}.pdf`);
      fs.writeFileSync(tmpIn, buffer);
      try {
        tmpOut = await qpdfDecrypt(tmpIn, password);
        const decrypted = fs.readFileSync(tmpOut);
        const data = await pdfParse(decrypted);
        res.json({ text: data.text });
      } catch {
        res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง ลองใหม่', encrypted: true, wrongPassword: true });
      }
    } else {
      try {
        const data = await pdfParse(buffer);
        res.json({ text: data.text });
      } catch (e) {
        const msg = e.message || '';
        const isEncrypted = /password|encrypt|protected|string did not match/i.test(msg);
        res.status(isEncrypted ? 401 : 500).json({ error: msg, encrypted: isEncrypted });
      }
    }
  } finally {
    try { if (tmpIn) fs.unlinkSync(tmpIn); } catch {}
    try { if (tmpOut) fs.unlinkSync(tmpOut); } catch {}
  }
});

module.exports = router;
