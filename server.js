const express = require('express');
const cors = require('cors');
const uploadRoute = require('./routes/upload');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use('/upload', uploadRoute);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));