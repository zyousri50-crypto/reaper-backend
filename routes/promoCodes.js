const express = require("express");
const router = express.Router();

const {
  createPromo,
  getPromos,
  validatePromo,
  updatePromo,
  deletePromo,
} = require("../controllers/promoCodeController");

// 👈 تعديل المسار الصحيح
const { auth, admin } = require("../middleware/authMiddleware");

// ======================
// ADMIN ROUTES
// ======================
// POST لإنشاء كود برومو جديد
router.post("/", auth, admin, (req, res, next) => {
  // التأكد من وجود كافة البيانات في الطلب (Validation Middleware)
  const { code, discountPercentage, expiresAt, maxUses } = req.body;

  if (!code || !discountPercentage || !expiresAt) {
    // في حال فشل التحقق، نُرسل استجابة خطأ JSON
    return res.status(400).json({ error: "Please provide all required fields" });
  }
  
  // إذا كانت البيانات صحيحة، نمرر التحكم إلى الـ Controller النهائي
  next();
}, createPromo); // 🌟 تم تسجيل createPromo كـ Controller نهائي هنا

// PUT لتحديث كود برومو
router.put("/:code", auth, admin, (req, res, next) => {
  const { code } = req.params;
  const { discountPercentage, expiresAt, maxUses } = req.body;

  // التأكد من وجود البيانات المطلوبة لتحديث الكود (Validation Middleware)
  if (!discountPercentage || !expiresAt) {
    return res.status(400).json({ error: "Please provide the discount and expiration date" });
  }

  // إذا كانت البيانات صحيحة، نمرر التحكم إلى الـ Controller النهائي
  next();
}, updatePromo); // 🌟 تم تسجيل updatePromo كـ Controller نهائي هنا

// DELETE لحذف كود برومو
router.delete("/:code", auth, admin, deletePromo);

// ======================
// PUBLIC ROUTES
// ======================
// GET لاسترجاع جميع الأكواد الترويجية
router.get("/all", getPromos);  // تم تعديل المسار هنا ليكون "/all"

// POST للتحقق من صلاحية كود البرومو
router.post("/validate", validatePromo);

module.exports = router;
