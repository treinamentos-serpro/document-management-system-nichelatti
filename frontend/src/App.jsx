import DocumentsPage from './pages/DocumentsPage';

export default function App() {
  const userId = import.meta.env.VITE_USER_ID || 'demo-user';

  return (
    <DocumentsPage userId={userId} />
  );
}
