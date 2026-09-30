// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const documentRepository = require('./repositories/documentRepository');
const fileRepository = require('./repositories/fileRepository');
const createDocumentService = require('./services/documentService');
const createDocumentController = require('./controllers/documentController');
const createDocumentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const documentService = createDocumentService({ documentRepository });
const documentController = createDocumentController({ documentService });
const documentRoutes = createDocumentRoutes({
  documentController,
  storageDirectory: fileRepository.getStorageDirectory(),
});

app.use(express.json());

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(documentRoutes);

app.use((error, request, response, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return response.status(413).json({ error: 'Arquivo acima do limite permitido.' });
  }

  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    console.error(error);
  }

  return response.status(statusCode).json({ error: error.message || 'Erro interno.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
