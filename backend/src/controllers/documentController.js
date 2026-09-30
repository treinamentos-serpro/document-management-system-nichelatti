function createDocumentController({ documentService }) {
  function upload(request, response, next) {
    try {
      const document = documentService.upload(
        request.file,
        request.get('X-User-Id')
      );
      response.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }

  function list(request, response, next) {
    try {
      response.json(documentService.list());
    } catch (error) {
      next(error);
    }
  }

  function download(request, response, next) {
    try {
      const document = documentService.findForDownload(request.params.id);
      response.download(document.filePath, document.originalName, (error) => {
        if (error && !response.headersSent) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    upload,
    list,
    download,
  };
}

module.exports = createDocumentController;