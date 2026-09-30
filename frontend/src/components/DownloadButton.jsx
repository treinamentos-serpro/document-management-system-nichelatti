import { getDownloadUrl } from '../services/documentService';

export default function DownloadButton({ documentId }) {
  return (
    <a
      href={getDownloadUrl(documentId)}
      download
      aria-label="Baixar documento"
    >
      Baixar
    </a>
  );
}