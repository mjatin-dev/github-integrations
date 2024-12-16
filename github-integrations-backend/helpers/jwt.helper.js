import jwt from 'jsonwebtoken';

// Secret key for JWT
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Verify token
export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};
