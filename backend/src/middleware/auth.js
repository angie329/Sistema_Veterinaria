import jwt from "jsonwebtoken";

/**
 * Middleware para verificar JWT en las peticiones
 * Uso: app.use(verifyJWT) en rutas protegidas
 */
export const verifyJWT = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, roleId, roleName }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

/**
 * Middleware para verificar roles específicos
 * Uso: app.use(requireRole('Admin', 'Veterinario'))
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const userRole = req.user.roleName;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "No tienes permisos para realizar esta acción",
        requiredRoles: allowedRoles,
        yourRole: userRole
      });
    }

    next();
  };
};

/**
 * Middleware opcional para rutas que pueden ser públicas o autenticadas
 */
export const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Token inválido pero no bloqueamos la petición
      req.user = null;
    }
  }

  next();
};