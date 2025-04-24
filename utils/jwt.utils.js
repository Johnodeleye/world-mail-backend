const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

exports.generateToken = (user) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};