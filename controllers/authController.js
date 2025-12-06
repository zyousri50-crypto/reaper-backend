const User = require("../dbModels/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// ===============================
// Register (Create First Admin)
// ===============================
exports.register = async (req, res) => {
  try {
    // Validate input
    await body("email").isEmail().withMessage("Invalid email").run(req);
    await body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check email exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // First user becomes admin
    const isFirstUser = (await User.countDocuments()) === 0;

    const newUser = await User.create({
      name,
      email,
      password, // ⚠ بدون hashing — Schema هيتولى التشفير
      isAdmin: isFirstUser,
    });

    res.json({
      message: "User registered",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Login
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare passwords (باستخدام الدالة من الـ Schema)
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
