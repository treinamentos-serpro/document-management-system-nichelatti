const path = require('node:path');
const documentRepository = require('../repositories/documentRepository');
const fileRepository = require('../repositories/fileRepository');
const { toPublicMetadata, toPublicMetadataList } = require('./documentMapper');

async function createDocument(file, owner) {
  const originalName = path.basename(file.originalname.replaceAll('\\', '/'));
  const document = {
    id: file.filename.split('.')[0],
    originalName,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storagePath: file.path,
  };

  try {
    documentRepository.save(document);
    return toPublicMetadata(document);
  } catch (error) {
    await fileRepository.remove(file.path);
    throw error;
  }
}

function listDocuments(owner) {
  return toPublicMetadataList(documentRepository.listByOwner(owner));
}

function getDocumentForDownload(id, owner) {
  return documentRepository.findByIdAndOwner(id, owner);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};
