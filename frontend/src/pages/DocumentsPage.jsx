import { useEffect, useState } from 'react';
import DocumentList from '../components/DocumentList';
import UploadForm from '../components/UploadForm';
import { listDocuments } from '../services/api';

export default function DocumentsPage({ userId }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDocuments() {
    setError('');
    try {
      setDocuments(await listDocuments(userId));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [userId]);

  return (
    <main>
      <h1>Meus documentos</h1>
      <p>Usuário: {userId}</p>
      <UploadForm userId={userId} onUploaded={loadDocuments} />
      <h2>Documentos enviados</h2>
      {isLoading && <p>Carregando...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && (
        <DocumentList documents={documents} userId={userId} onError={(downloadError) => setError(downloadError.message)} />
      )}
    </main>
  );
}
