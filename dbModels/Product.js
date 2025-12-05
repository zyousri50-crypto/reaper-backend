const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    // الاسم الأساسي للمنتج
    name: { type: String, required: true, trim: true },

    // العنوان (اختياري)
    title: { type: String, trim: true },

    // وصف المنتج
    description: { type: String, default: "", trim: true },

    // الأسعار
    price: { type: Number, required: true, min: 0 },          // السعر الأساسي
    originalPrice: { type: Number, min: 0 },                  // السعر قبل الخصم
    discount: { type: Number, default: 0, min: 0, max: 100 }, // الخصم %

    // الصور
    image: { type: String, required: true }, // الصورة الرئيسية
    images: { type: [String], default: [] }, // باقي الصور

    // المقاسات (يمكن أن تحتوي على كائنات لتوضيح التوافر)
    sizes: {
      type: [
        {
          size: { type: String, required: true },
          available: { type: Boolean, required: true },
        },
      ],
      default: [],
    },

    // الألوان (كل لون يحتوي على اسم ورمز سداسي)
    colors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
      ],
      default: [],
    },

    // الفئة
    category: { type: String, required: true },

    // خصائص إضافية
    featured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },

    // فلاتر للواجهة
    bestSelling: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },

    // كود خصم مرتبط بالمنتج مباشرة (اختياري)
    promoCode: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
