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
  // التأكد من وجود كافة البيانات في الطلب
  const { code, discountPercentage, expiresAt, maxUses } = req.body;

  if (!code || !discountPercentage || !expiresAt) {
    return res.status(400).json({ error: "Please provide all required fields" });
  }
  
  // إذا كانت البيانات صحيحة، استدعاء الدالة الخاصة بإنشاء البرومو
  createPromo(req, res, next);
});

// PUT لتحديث كود برومو
router.put("/:code", auth, admin, (req, res, next) => {
  const { code } = req.params;
  const { discountPercentage, expiresAt, maxUses } = req.body;

  // التأكد من وجود البيانات المطلوبة لتحديث الكود
  if (!discountPercentage || !expiresAt) {
    return res.status(400).json({ error: "Please provide the discount and expiration date" });
  }

  // إذا كانت البيانات صحيحة، استدعاء الدالة الخاصة بتحديث البرومو
  updatePromo(req, res, next);
});

// DELETE لحذف كود برومو
router.delete("/:code", auth, admin, deletePromo);

// ======================
// PUBLIC ROUTES
// ======================
// GET لاسترجاع جميع الأكواد الترويجية
router.get("/", getPromos);

// POST للتحقق من صلاحية كود البرومو
router.post("/validate", validatePromo);

module.exports = router;
