const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // جلب التوكن من الهيدر

  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided" }); // إذا لم يكن التوكن موجودًا
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // التحقق من صحة التوكن
    req.user = verified; // تخزين بيانات المستخدم في الكائن req.user

    // تحقق من وجود بيانات المستخدم
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "Invalid token data" }); // إذا كانت بيانات التوكن غير صحيحة
    }

    console.log(`Authenticated user: ${req.user.id}`);
    next(); // الانتقال إلى الخطوة التالية في المسار

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired, please login again" }); // في حالة انتهاء صلاحية التوكن
    }

    console.error("Token verification failed", err);
    return res.status(401).json({ error: "Invalid token" }); // في حالة فشل التحقق من التوكن
  }
};

exports.admin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" }); // إذا لم يكن المستخدم لديه صلاحيات المسؤول
  }

  next(); // إذا كانت الصلاحيات صحيحة، انتقل إلى الخطوة التالية
};
