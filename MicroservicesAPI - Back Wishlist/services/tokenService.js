const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET || "default_secret"; // à mettre dans ton .env

function generateToken(payload, expiresIn = "1h") {
  return jwt.sign(payload, secretKey, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
