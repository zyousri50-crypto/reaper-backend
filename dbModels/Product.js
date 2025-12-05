const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    description: { type: String, default: "", trim: true },

    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },

    // الصورة الرئيسية
    image: { type: String, required: true },

    // جاليري صور
    images: { type: [String], default: [] },

    // المقاسات (STRING[] فقط)
    sizes: { type: [String], default: [] },

    // الألوان (STRING[] مثل ["Red", "Black", "White"])
    colors: { type: [String], default: [] },

    category: { type: String, required: true },

    featured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },

    bestSelling: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },

    promoCode: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
