const fs = require('node:fs');
const path = require('node:path');

const storageDirectory = path.resolve(
  process.env.STORAGE_DIR || path.join(__dirname, '../../storage')
);

function ensureStorageDirectory() {
  fs.mkdirSync(storageDirectory, { recursive: true });
}

function getStorageDirectory() {
  ensureStorageDirectory();
  return storageDirectory;
}

module.exports = {
  getStorageDirectory,
};