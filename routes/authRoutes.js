const router = require("express").Router();
const { register, login } = require("../controllers/authController");

// التحقق من المدخلات
const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // تحقق من البريد الإلكتروني
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  next();
};

// Register new user with validation
router.post("/register", validateRegisterInput, register);

// Login user with validation
router.post("/login", validateLoginInput, login);

module.exports = router;
