const express = require('express');
const multer = require('multer');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(documentRoutes);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'O arquivo excede o tamanho máximo permitido.'
      : 'O upload é inválido.';
    return res.status(400).json({ error: { code: error.code, message } });
  }

  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Não foi possível processar a solicitação.' },
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
