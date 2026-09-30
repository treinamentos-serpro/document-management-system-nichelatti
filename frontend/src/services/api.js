const apiBase = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, options);
  const body = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(body?.error?.message || 'Não foi possível concluir a solicitação.');
  }

  return body;
}

export function listDocuments(userId) {
  return request('/documents', { headers: { 'x-user-id': userId } });
}

export function uploadDocument(userId, file) {
  const formData = new FormData();
  formData.append('file', file);

  return request('/upload', {
    method: 'POST',
    headers: { 'x-user-id': userId },
    body: formData,
  });
}

export async function downloadDocument(userId, documentMetadata) {
  const response = await fetch(`${apiBase}/documents/${encodeURIComponent(documentMetadata.id)}/download`, {
    headers: { 'x-user-id': userId },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || 'Não foi possível baixar o documento.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = documentMetadata.originalName;
  anchor.click();
  URL.revokeObjectURL(url);
}
