const documentService = require('../services/documentService');

async function upload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'FILE_REQUIRED', message: 'Envie um arquivo.' } });
    }

    const document = await documentService.createDocument(req.file, req.user.id);
    return res.status(201).json(document);
  } catch (error) {
    return next(error);
  }
}

function list(req, res) {
  return res.json(documentService.listDocuments(req.user.id));
}

function download(req, res, next) {
  try {
    const document = documentService.getDocumentForDownload(req.params.id, req.user.id);

    if (!document) {
      return res.status(404).json({ error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' } });
    }

    return res.download(document.storagePath, document.originalName, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  upload,
  list,
  download,
};
