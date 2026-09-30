const express = require('express');
const multer = require('multer');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function createDocumentRoutes({ documentController, storageDirectory }) {
  const router = express.Router();
  const upload = multer({
    storage: multer.diskStorage({
      destination: storageDirectory,
      filename: (request, file, callback) => {
        callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024),
    },
  });

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);

  return router;
}

module.exports = createDocumentRoutes;