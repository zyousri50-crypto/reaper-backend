const PromoCode = require("../dbModels/PromoCode");

// ===============================
// Create Promo Code
// ===============================
exports.createPromo = async (req, res) => {
  try {
    const { code, discountPercentage, expiresAt, maxUses } = req.body;

    // Check if promo exists
    const exists = await PromoCode.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ error: "Promo code already exists" });
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountPercentage,
      expiresAt: expiresAt || null,
      maxUses: maxUses || 0,
    });

    res.json({ message: "Promo code created", promo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Get All Promo Codes
// ===============================
exports.getPromos = async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Validate Promo Code (Frontend Use)
// ===============================
exports.validatePromo = async (req, res) => {
  try {
    const { code } = req.body;

    const promo = await PromoCode.findOne({ code: code.toUpperCase() });

    if (!promo) return res.status(404).json({ error: "Promo code not found" });

    if (!promo.isValid()) {
      return res.status(400).json({ error: "Promo code is invalid or expired" });
    }

    res.json({
      valid: true,
      discount: promo.discountPercentage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Update Promo Code
// ===============================
exports.updatePromo = async (req, res) => {
  try {
    const { code } = req.params;

    const updated = await PromoCode.findOneAndUpdate(
      { code: code.toUpperCase() },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Promo not found" });

    res.json({ message: "Promo updated", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Delete Promo Code
// ===============================
exports.deletePromo = async (req, res) => {
  try {
    const { code } = req.params;

    const deleted = await PromoCode.findOneAndDelete({ code: code.toUpperCase() });

    if (!deleted) return res.status(404).json({ error: "Promo not found" });

    res.json({ message: "Promo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
