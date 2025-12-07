const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Generate JWT token
const generateToken = (userId, email, name) => {
  return jwt.sign({ userId, email, name }, JWT_SECRET, { expiresIn: "7d" })
}

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" })
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
}
