const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    // ... (باقي الحقول دون تغيير) ...

    // جاليري صور
    images: { type: [String], default: [] },

    // المقاسات (يمكن الإبقاء عليها كنصوص إذا لم تضف تفاصيل أخرى)
    sizes: { type: [String], default: [] }, 

    // 🎨 التعديل لحل خطأ 500: تغيير من [String] إلى مصفوفة كائنات مُحددة
    colors: [
        {
            name: { type: String, required: true },
            hex: { type: String, required: true }
        }
    ],

    category: { type: String, required: true },

    // ... (باقي الحقول دون تغيير) ...
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
