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

test('exige um usuário válido', async () => {
  const response = await request('/documents');

  assert.equal(response.status, 401);
});

test('faz upload, lista e baixa apenas para o proprietário', async () => {
  const formData = new FormData();
  formData.append('file', new Blob(['conteúdo seguro'], { type: 'text/plain' }), '../relatorio.txt');

  const uploadResponse = await request('/upload', {
    method: 'POST',
    headers: { 'x-user-id': 'alice' },
    body: formData,
  });
  const metadata = await uploadResponse.json();

  assert.equal(uploadResponse.status, 201);
  assert.equal(metadata.originalName, 'relatorio.txt');
  assert.equal(metadata.owner, 'alice');
  assert.match(metadata.id, /^[a-f0-9-]{36}$/);

  const ownerList = await request('/documents', { headers: { 'x-user-id': 'alice' } });
  assert.equal((await ownerList.json()).length, 1);

  const otherList = await request('/documents', { headers: { 'x-user-id': 'bob' } });
  assert.deepEqual(await otherList.json(), []);

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
