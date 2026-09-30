function toPublicMetadata(document) {
  const { storagePath, ...metadata } = document;
  return metadata;
}

function toPublicMetadataList(documents) {
  return documents.map(toPublicMetadata);
}

module.exports = {
  toPublicMetadata,
  toPublicMetadataList,
};
