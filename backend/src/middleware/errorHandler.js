// backend/src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreur Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({
          error: 'Conflit de données',
          message: 'Cette valeur existe déjà dans la base de données',
          field: err.meta?.target
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Ressource non trouvée',
          message: 'L\'enregistrement demandé n\'existe pas'
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Contrainte de clé étrangère',
          message: 'Impossible de supprimer ou modifier en raison de dépendances'
        });
      default:
        return res.status(500).json({
          error: 'Erreur de base de données',
          message: err.message
        });
    }
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: err.message,
      errors: err.errors
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Votre session a expiré ou est invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Votre session a expiré, veuillez vous reconnecter'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;