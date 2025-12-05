const express = require("express");
const router = express.Router();

const {
  createPromo,
  getPromos,
  validatePromo,
  updatePromo,
  deletePromo
} = require("../controllers/promoCodeController");

const { auth, admin } = require("../middleware/auth");

// ADMIN ROUTES
router.post("/", auth, admin, createPromo);
router.put("/:code", auth, admin, updatePromo);
router.delete("/:code", auth, admin, deletePromo);

// PUBLIC ROUTES
router.get("/", getPromos);
router.post("/validate", validatePromo);

module.exports = router;
