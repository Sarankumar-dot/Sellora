import ApiError from '../errors/ApiError.js';
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'unauthorized access');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (e) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const role = req.user.role;

    if (roles.includes(role)) {
      next();
    } else {
      throw new ApiError(403, 'Forbidden access');
    }
  };
};

export { verifyToken, authorize };
