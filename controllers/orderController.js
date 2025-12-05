const Product = require("../dbModels/Product");
const Order = require("../dbModels/Order");

exports.addOrder = async (req, res) => {
  try {
    const { items, name, phone, address, city, paymentMethod, total } = req.body;

    // التحقق من وجود عناصر الطلب
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items cannot be empty" });
    }

    // التحقق من وجود المنتجات فعلاً
    const normalizedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        return {
          productId: product._id,
          name: product.name,
          price: item.price || product.price,
          quantity: item.quantity,
          image: product.image || null,
        };
      })
    );

    // التحقق من طريقة الدفع
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

    const savedOrder = await newOrder.save();
    res.json(savedOrder);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عرض جميع الطلبات
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عرض طلب واحد
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
