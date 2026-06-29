const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { imageData, categories } = req.body;
  if (!imageData) return res.status(400).json({ error: 'No image data' });

  const prompt = `อ่านใบเสร็จ/ใบกำกับภาษีของไทยในรูปนี้ แล้วตอบกลับเป็น JSON object เพียงอย่างเดียว ห้ามมีคำอธิบายหรือ markdown ใด ๆ:
{"amount": ยอดรวมสุทธิที่ต้องจ่ายเป็นตัวเลขล้วนไม่มีคอมมา (ถ้ามีภาษีให้ใช้ยอดที่รวมภาษีแล้ว), "merchant": "ชื่อร้านหรือผู้ขาย", "date": "วันที่ในใบเสร็จรูปแบบ YYYY-MM-DD", "category": "เลือกหมวดที่ใกล้เคียงที่สุด 1 หมวดจากรายการนี้เท่านั้น: ${(categories || []).join(' | ')}", "items": "สรุปสิ่งที่ซื้อสั้น ๆ ไม่เกิน 50 ตัวอักษร"}
ถ้าหาค่าใดไม่พบ ให้ใส่ "" สำหรับข้อความ หรือ 0 สำหรับตัวเลข`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageData } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    const data = await apiRes.json();
    if (!apiRes.ok) return res.status(apiRes.status).json(data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
