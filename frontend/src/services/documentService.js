async function parseResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Não foi possível concluir a operação.');
  }

  return response;
}

export async function listDocuments() {
  const response = await fetch('/api/documents');
  await parseResponse(response);
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  await parseResponse(response);
  return response.json();
}

export function getDownloadUrl(documentId) {
  return `/api/documents/${encodeURIComponent(documentId)}/download`;
}