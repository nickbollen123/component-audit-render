const express = require('express');
const formidable = require('formidable');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const { scanComponents } = require('../utils/scanComponents');

const router = express.Router();

router.post('/', (req, res) => {
  const form = new formidable.IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    const zipPath = files.zipfile.filepath;
    const extractPath = path.join('/tmp', `extracted-${Date.now()}`);
    fs.ensureDirSync(extractPath);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    const components = await scanComponents(extractPath);
    res.json({ components });
  });
});

module.exports = router;