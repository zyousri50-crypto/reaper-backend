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

// Get all promo codes (for admin page display)
router.get("/all", getPromos);

// Validate promo on checkout
router.post("/validate", validatePromo);

// ======================
// ADMIN ROUTES
// ======================

// Create new promo code
router.post("/", auth, admin, createPromo);

// Update promo by code
router.put("/:code", auth, admin, updatePromo);

// Delete promo by code
router.delete("/:code", auth, admin, deletePromo);

module.exports = router;
