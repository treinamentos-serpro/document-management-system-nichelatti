import { useState } from 'react';
import { uploadDocument } from '../services/api';

export default function UploadForm({ userId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Selecione um arquivo.');
      return;
    }

    setError('');
    setIsUploading(true);
    try {
      await uploadDocument(userId, file);
      setFile(null);
      event.target.reset();
      await onUploaded();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="document-file">Arquivo</label>
      <input
        id="document-file"
        type="file"
        onChange={(event) => setFile(event.target.files[0] || null)}
        disabled={isUploading}
      />
      <button type="submit" disabled={isUploading || !file}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
