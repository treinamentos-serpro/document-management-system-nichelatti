const { randomUUID } = require('node:crypto');
const fs = require('node:fs');

function createDocumentService({ documentRepository }) {
  function upload(file, owner) {
    if (!file) {
      const error = new Error('Nenhum arquivo foi enviado.');
      error.statusCode = 400;
      throw error;
    }

    const document = {
      id: randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: owner || 'anonymous',
      filePath: file.path,
      mimeType: file.mimetype,
    };

    documentRepository.save(document);
    return toPublicMetadata(document);
  }

  function list() {
    return documentRepository.findAll().map(toPublicMetadata);
  }

  function findForDownload(id) {
    const document = documentRepository.findById(id);
    if (!document) {
      const error = new Error('Documento não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (!fs.existsSync(document.filePath)) {
      const error = new Error('Arquivo do documento não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    return document;
  }

  return {
    upload,
    list,
    findForDownload,
  };
}

function toPublicMetadata(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

module.exports = createDocumentService;