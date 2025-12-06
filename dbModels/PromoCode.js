const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // للتأكد من تخزين الكود بأحرف كبيرة
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1, // أقل نسبة خصم 1%
    max: 100, // أقصى نسبة خصم 100%
  },
  isActive: {
    type: Boolean,
    default: true, // للتحكم في تفعيل/إلغاء تفعيل الكود من صفحة الأدمن
  },
  expiresAt: {
    type: Date,
    default: null, // يمكن أن يكون فارغًا إذا لم يكن له تاريخ انتهاء
  },
  maxUses: {
    type: Number,
    default: 0, // 0 يعني استخدام غير محدود
  },
  usedCount: {
    type: Number,
    default: 0, // عدد الاستخدامات التي تم استخدامها
  },
}, { timestamps: true });

// التأكد من أن الكود لم ينتهِ بعد ولم يتم استخدامه أكثر من الحد الأقصى
PromoCodeSchema.methods.isValid = function() {
  const currentDate = new Date();

  // تحقق من تاريخ الانتهاء
  if (this.expiresAt && this.expiresAt < currentDate) {
    return false;
  }

  // تحقق من الحد الأقصى للاستخدام
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) {
    return false;
  }

  // تحقق من حالة الكود
  if (!this.isActive) {
    return false;
  }

  return true;
};

module.exports = mongoose.model('PromoCode', PromoCodeSchema);
