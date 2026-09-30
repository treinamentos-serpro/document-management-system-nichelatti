const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function listByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt));
}

function findByIdAndOwner(id, owner) {
  const document = documents.get(id);
  return document && document.owner === owner ? document : null;
}

function clear() {
  documents.clear();
}

module.exports = {
  save,
  listByOwner,
  findByIdAndOwner,
  clear,
};
