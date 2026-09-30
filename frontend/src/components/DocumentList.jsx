import { downloadDocument } from '../services/api';

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export default function DocumentList({ documents, userId, onError }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado ainda.</p>;
  }

  return (
    <ul>
      {documents.map((document) => (
        <li key={document.id}>
          <span>{document.originalName} ({document.size} bytes, {formatDate(document.uploadedAt)})</span>{' '}
          <button type="button" onClick={() => downloadDocument(userId, document).catch(onError)}>
            Baixar
          </button>
        </li>
      ))}
    </ul>
  );
}
