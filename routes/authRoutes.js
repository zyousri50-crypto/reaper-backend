const router = require("express").Router();
const { register, login } = require("../controllers/authController");

// ===============================
// Validate Register
// ===============================
const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Email pattern
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
};

// ===============================
// Validate Login
// ===============================
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  next();
};

// ===============================
// Routes
// ===============================

// Register
router.post("/register", validateRegisterInput, register);

// Login
router.post("/login", validateLoginInput, login);

module.exports = router;
