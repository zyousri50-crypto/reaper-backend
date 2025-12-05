const router = require('express').Router();
const PromoCode = require('../dbModels/PromoCode');

// Middleware للتحقق من أن المستخدم هو مسؤول (Admin)
const verifyAdmin = (req, res, next) => {
    // منطق التحقق من صلاحية الأدمن هنا
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json("Access Denied! Not an administrator.");
    }
};

// Helper to validate promo code data
const validatePromoCodeData = (req, res, next) => {
    const { code, discountPercentage, expiresAt, maxUses } = req.body;

    // تحقق من أن جميع الحقول المطلوبة موجودة
    if (!code || !discountPercentage) {
        return res.status(400).json({ error: "Code and Discount Percentage are required" });
    }

    // تحقق من أن الخصم بين 1 و 100
    if (discountPercentage < 1 || discountPercentage > 100) {
        return res.status(400).json({ error: "Discount percentage must be between 1 and 100" });
    }

    // تحقق من أن تاريخ الانتهاء إذا كان موجودًا صالح
    if (expiresAt && new Date(expiresAt) < new Date()) {
        return res.status(400).json({ error: "Expiration date cannot be in the past" });
    }

    // تحقق من أن عدد الاستخدامات لا يتجاوز الحد الأقصى (إن كان محددًا)
    if (maxUses < 0) {
        return res.status(400).json({ error: "Max uses cannot be negative" });
    }

    next();
};

// A. إنشاء برومو كود جديد (ADMIN ONLY)
router.post('/', verifyAdmin, validatePromoCodeData, async (req, res) => {
  try {
    const newCode = new PromoCode(req.body);
    const savedCode = await newCode.save();
    res.status(201).json(savedCode);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create promo code" });
  }
});

// B. تحديث برومو كود (ADMIN ONLY)
router.put('/:id', verifyAdmin, validatePromoCodeData, async (req, res) => {
  try {
    const updatedCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedCode);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update promo code" });
  }
});

// C. حذف برومو كود (ADMIN ONLY)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.status(200).json("Promo code has been deleted...");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete promo code" });
  }
});

// D. جلب كل الأكواد (لصفحة الأدمن)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.status(200).json(promoCodes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch promo codes" });
  }
});

module.exports = router;
