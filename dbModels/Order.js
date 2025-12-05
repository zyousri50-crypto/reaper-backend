const Product = require("../dbModels/Product");
const Order = require("../dbModels/Order");

exports.addOrder = async (req, res) => {
  try {
    const { items, name, phone, address, city, paymentMethod, total } = req.body;

    // التحقق من أن الـ items موجودة و ليست فارغة
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items cannot be empty" });
    }

    // التأكد من وجود المنتجات داخل الطلب
    const normalizedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
      }
      
      // تطبيع بيانات المنتج
      return {
  ...product.toObject(),   // يحول الـ product لبيانات جاهزة
  quantity: item.quantity,
  price: item.price || product.price,
};
    }));

    // تحقق من طرق الدفع
    const validPaymentMethods = ["credit_card", "paypal", "cash_on_delivery"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    // إنشاء الطلب
    const newOrder = new Order({
      name,
      phone,
      address,
      city,
      paymentMethod,
      items: normalizedItems,
      total,
    });

    // حفظ الطلب
    const savedOrder = await newOrder.save();
    res.json(savedOrder);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
