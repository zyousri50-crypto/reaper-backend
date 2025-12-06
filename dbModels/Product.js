const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        price: { type: Number, required: true, min: 0.01 }, // تأكد أن هذا الحقل موجود وصحيح
        category: { type: String, required: true },
        image: { type: String, default: "" }, // الصورة الرئيسية
        
        // جاليري صور
        images: { type: [String], default: [] },

        // المقاسات
        sizes: { type: [String], default: [] }, 

        // 🎨 التعديل لحل خطأ 500: تغيير من [String] إلى مصفوفة كائنات مُحددة
        colors: [
            {
                name: { type: String, required: true },
                hex: { type: String, required: true }
            }
        ],
        
        discount: { type: Number, default: 0, min: 0, max: 90 },
        bestSelling: { type: Boolean, default: false },
        newArrival: { type: Boolean, default: true },
        outOfStock: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
