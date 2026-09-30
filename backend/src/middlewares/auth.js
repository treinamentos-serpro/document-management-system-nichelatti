function authenticate(req, res, next) {
  const userId = req.get('x-user-id');

  if (!userId || !/^[a-zA-Z0-9_-]{1,64}$/.test(userId)) {
    return res.status(401).json({
      error: { code: 'AUTHENTICATION_REQUIRED', message: 'Informe um usuário válido no header x-user-id.' },
    });
  }

  req.user = { id: userId };
  return next();
}

module.exports = authenticate;
