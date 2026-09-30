const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const storageDirectory = path.join(os.tmpdir(), `dms-test-${randomUUID()}`);
process.env.STORAGE_DIR = storageDirectory;
const app = require('../src/app');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa um documento', async () => {
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob(['conteudo do documento'], { type: 'text/plain' }),
      'exemplo.txt'
    );

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'user-1' },
      body: formData,
    });
    assert.strictEqual(uploadResponse.status, 201);
    const uploadedDocument = await uploadResponse.json();
    assert.strictEqual(uploadedDocument.originalName, 'exemplo.txt');
    assert.strictEqual(uploadedDocument.owner, 'user-1');

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200);
    assert.deepStrictEqual(await listResponse.json(), [uploadedDocument]);

    const downloadResponse = await fetch(
      `${baseUrl}/documents/${uploadedDocument.id}/download`
    );
    assert.strictEqual(downloadResponse.status, 200);
    assert.strictEqual(await downloadResponse.text(), 'conteudo do documento');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(storageDirectory, { recursive: true, force: true });
  }
});

test('rejeita upload sem arquivo', async () => {
  const server = app.listen(0);
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/upload`, {
      method: 'POST',
      body: new FormData(),
    });
    assert.strictEqual(response.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
