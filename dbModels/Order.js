const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    name: { type: String, required: true },
    image: { type: String, required: true },

    price: { type: Number, required: true },
    quantity: { type: Number, required: true },

    // من الواجهة: selectedSize - selectedColor
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },      // اسم العميل
    phone: { type: String, required: true },     // رقم الهاتف
    address: { type: String, required: true },   // العنوان
    city: { type: String, required: true },      // المدينة

    paymentMethod: { type: String, required: true },

    items: { type: [OrderItemSchema], required: true },

    total: { type: Number, required: true },     // إجمالي تكلفة الأوردر

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
