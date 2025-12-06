const express = require("express");
const router = express.Router();

const {
  createPromo,
  getPromos,
  validatePromo,
  updatePromo,
  deletePromo,
} = require("../controllers/promoCodeController");

const { auth, admin } = require("../middleware/authMiddleware");

// ======================
// PUBLIC ROUTES
// ======================

// GET all promo codes
router.get("/all", getPromos);

// Validate promo code (frontend cart use)
router.post("/validate", validatePromo);

// ======================
// ADMIN ROUTES
// ======================

// Create promo
router.post("/", auth, admin, createPromo);

// Update promo
router.put("/:code", auth, admin, updatePromo);

// Delete promo
router.delete("/:code", auth, admin, deletePromo);

module.exports = router;
