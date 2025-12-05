const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  // التأكد من وجود التوكن
  if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    // يمكن إضافة سجل هنا لتتبع المستخدم الذي تم التحقق منه
    console.log(`Authenticated user: ${req.user.id}`);

    next();
  } catch (err) {
    console.error("Token verification failed", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

exports.admin = (req, res, next) => {
  // التأكد من أن المستخدم هو Admin
  if (!req.user?.isAdmin)
    return res.status(403).json({ error: "Admin access required" });

  next();
};
