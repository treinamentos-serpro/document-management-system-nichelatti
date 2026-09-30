const fs = require('node:fs/promises');

async function remove(filePath) {
  await fs.unlink(filePath).catch(() => {});
}

module.exports = {
  remove,
};
