const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');
const { storageDirectory } = require('../src/middlewares/upload');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(async () => {
  documentRepository.clear();
  const files = await fs.readdir(storageDirectory);
  await Promise.all(files
    .filter((file) => file !== '.gitkeep')
    .map((file) => fs.unlink(path.join(storageDirectory, file))));
});

after(() => server.close());

async function request(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, options);
}

async function uploadDocument(owner, content = 'conteúdo seguro', filename = 'relatorio.txt') {
  const formData = new FormData();
  formData.append('file', new Blob([content], { type: 'text/plain' }), filename);

  const response = await request('/upload', {
    method: 'POST',
    headers: { 'x-user-id': owner },
    body: formData,
  });

  return { response, metadata: await response.json() };
}

test('exige um usuário válido', async () => {
  const response = await request('/documents');

  assert.equal(response.status, 401);
});

test('faz upload de um documento', async () => {
  const { response, metadata } = await uploadDocument('alice', 'conteúdo seguro', '../relatorio.txt');

  assert.equal(response.status, 201);
  assert.equal(metadata.originalName, 'relatorio.txt');
  assert.equal(metadata.size, Buffer.byteLength('conteúdo seguro'));
  assert.equal(metadata.owner, 'alice');
  assert.match(metadata.id, /^[a-f0-9-]{36}$/);
  assert.ok(metadata.uploadedAt);
  assert.equal(metadata.storagePath, undefined);
});

test('lista apenas os documentos do proprietário', async () => {
  const { metadata } = await uploadDocument('alice');
  await uploadDocument('bob', 'outro conteúdo', 'privado.txt');

  const ownerList = await request('/documents', { headers: { 'x-user-id': 'alice' } });
  assert.equal(ownerList.status, 200);
  assert.deepEqual(await ownerList.json(), [metadata]);

  const emptyList = await request('/documents', { headers: { 'x-user-id': 'charlie' } });
  assert.deepEqual(await emptyList.json(), []);
});

test('baixa um documento apenas para o proprietário', async () => {
  const { metadata } = await uploadDocument('alice');

  const forbiddenDownload = await request(`/documents/${metadata.id}/download`, {
    headers: { 'x-user-id': 'bob' },
  });
  assert.equal(forbiddenDownload.status, 404);

  const download = await request(`/documents/${metadata.id}/download`, {
    headers: { 'x-user-id': 'alice' },
  });
  assert.equal(download.status, 200);
  assert.equal(await download.text(), 'conteúdo seguro');
});

test('rejeita upload sem arquivo', async () => {
  const response = await request('/upload', {
    method: 'POST',
    headers: { 'x-user-id': 'alice' },
  });

  assert.equal(response.status, 400);
});
