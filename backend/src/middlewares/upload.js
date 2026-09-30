const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const storageDirectory = path.resolve(__dirname, '../../storage');
fs.mkdirSync(storageDirectory, { recursive: true });

const configuredMaxSize = Number(process.env.MAX_UPLOAD_SIZE);
const maxUploadSize = Number.isFinite(configuredMaxSize) && configuredMaxSize > 0
  ? configuredMaxSize
  : 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, storageDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 10);
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadSize,
    files: 1,
    fields: 5,
    parts: 6,
  },
});

module.exports = { upload, storageDirectory };
