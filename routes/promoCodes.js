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
router.post("/", auth, admin, createPromo);
router.put("/:code", auth, admin, updatePromo);
router.delete("/:code", auth, admin, deletePromo);

// ======================
// PUBLIC ROUTES
// ======================
router.get("/", getPromos);
router.post("/validate", validatePromo);

module.exports = router;
