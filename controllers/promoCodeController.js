const PromoCode = require("../dbModels/PromoCode");

// ===============================
// Create Promo Code
// ===============================
exports.createPromo = async (req, res) => {
  try {
    const { code, discountPercentage, expiresAt, maxUses } = req.body;

    // تحقق من أن الحقول ليست فارغة
    if (!code || !discountPercentage || !expiresAt) {
      return res.status(400).json({ error: "Please provide all required fields." });
    }

    // تحقق من أن discountPercentage بين 1 و 100
    if (discountPercentage < 1 || discountPercentage > 100) {
      return res.status(400).json({ error: "Discount percentage must be between 1 and 100." });
    }

    // تحقق من صلاحية تاريخ expiresAt
    if (expiresAt && isNaN(Date.parse(expiresAt))) {
      return res.status(400).json({ error: "Invalid expiration date." });
    }

    // تحقق إذا كان الكود موجودًا بالفعل
    const exists = await PromoCode.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ error: "Promo code already exists" });
    }

    // أنشئ الكود الترويجي في قاعدة البيانات
    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountPercentage,
      expiresAt: expiresAt || null,
      maxUses: maxUses || 0,
    });

    res.json({ message: "Promo code created", promo });
  } catch (err) {
    res.status(500).json({ error: "Failed to create promo code: " + err.message });
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
    res.status(500).json({ error: "Failed to fetch promo codes: " + err.message });
  }
};

// ===============================
// Validate Promo Code (Frontend Use)
// ===============================
exports.validatePromo = async (req, res) => {
  try {
    const { code } = req.body;

    // تحقق إذا كان الكود موجودًا
    const promo = await PromoCode.findOne({ code: code.toUpperCase() });

    if (!promo) return res.status(404).json({ error: "Promo code not found" });

    // تحقق من صلاحية الكود
    if (!promo.isValid()) {
      return res.status(400).json({ error: "Promo code is invalid or expired" });
    }

    res.json({
      valid: true,
      discount: promo.discountPercentage,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate promo code: " + err.message });
  }
};

// ===============================
// Update Promo Code
// ===============================
exports.updatePromo = async (req, res) => {
  try {
    const { code } = req.params;

    // تحقق من أن الكود موجود
    const updated = await PromoCode.findOneAndUpdate(
      { code: code.toUpperCase() },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Promo not found" });

    res.json({ message: "Promo updated", updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update promo code: " + err.message });
  }
};

// ===============================
// Delete Promo Code
// ===============================
exports.deletePromo = async (req, res) => {
  try {
    const { code } = req.params;

    // تحقق من أن الكود موجود قبل حذفه
    const deleted = await PromoCode.findOneAndDelete({ code: code.toUpperCase() });

    if (!deleted) return res.status(404).json({ error: "Promo not found" });

    res.json({ message: "Promo deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete promo code: " + err.message });
  }
};
