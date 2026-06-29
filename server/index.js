require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const dataRoutes = require('./routes/data');
const photoRoutes = require('./routes/photos');
const scanRoutes = require('./routes/scan');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/family-data', dataRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/scan-receipt', scanRoutes);

// serve client build in production
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
