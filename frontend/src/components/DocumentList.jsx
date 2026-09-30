import DownloadButton from './DownloadButton';

export default function DocumentList({ documents, isLoading, error }) {
  if (isLoading) {
    return <p>Carregando documentos...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <ul>
      {documents.map((document) => (
        <li key={document.id}>
          <span>
            {document.originalName} ({document.size} bytes)
          </span>{' '}
          <DownloadButton documentId={document.id} />
        </li>
      ))}
    </ul>
  );
}