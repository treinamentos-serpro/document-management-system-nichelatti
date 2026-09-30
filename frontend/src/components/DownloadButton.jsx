import { getDownloadUrl } from '../services/documentService';

export default function DownloadButton({ documentId }) {
  return (
    <a href={getDownloadUrl(documentId)} download>
      Baixar
    </a>
  );
}