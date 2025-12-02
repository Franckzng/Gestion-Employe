// backend/src/middleware/auth.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Vérifier si l'utilisateur est authentifié
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Non autorisé, token manquant' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        employee: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Non autorisé, token invalide' });
  }
};

// Vérifier si l'utilisateur a le rôle requis
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Accès refusé. Rôle requis: ${roles.join(' ou ')}` 
      });
    }

    next();
  };
};

// Vérifier si c'est le propriétaire ou un admin
const authorizeOwnerOrAdmin = (req, res, next) => {
  const employeeId = req.params.id;
  
  if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
    return next();
  }

  if (req.user.employee && req.user.employee.id === employeeId) {
    return next();
  }

  return res.status(403).json({ 
    error: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres données.' 
  });
};

module.exports = { protect, authorize, authorizeOwnerOrAdmin };