const axios = require("axios");
const Order = require("../dbModels/Order");

// ==================================================
// ⭐ SEND WHATSAPP FUNCTION
// ==================================================
const sendWhatsApp = async (phone, status, orderId) => {
  try {
    const idStr = String(orderId);
    const shortId = idStr.slice(-6);

    const message =
      status === "processing"
        ? `🔄 طلبك رقم ${shortId} جاري تجهيزه الآن.`
        : status === "shipped"
        ? `🚚 طلبك رقم ${shortId} خرج مع المندوب وهو في الطريق إليك.`
        : status === "delivered"
        ? `✅ تم تسليم طلبك رقم ${shortId} بنجاح! ❤️`
        : `✔️ تم استلام طلبك رقم ${shortId} بنجاح.`;

    await axios.post(
      "https://api.ultramsg.com/instance153217/messages/chat?token=0egooobqitqzhbxd",
      {
        to: phone.startsWith("+") ? phone : `+2${phone}`,
        body: message,
        priority: "10",
      }
    );

    console.log("WhatsApp Sent →", phone);
  } catch (err) {
    console.log("WhatsApp Error:", err?.response?.data || err);
  }
};

// ==================================================
// CREATE ORDER
// ==================================================
exports.createOrder = async (req, res) => {
  try {
    const { name, phone, address, items } = req.body;

    if (!name || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ⭐⭐⭐ التعديل هنا: تعيين الحالة الأولية للطلب ⭐⭐⭐
    const orderData = {
        ...req.body,
        status: 'pending' // أو 'confirmed' حسب المنطق الأولي لديك
    };

    const order = new Order(orderData);
    await order.save();

    // يمكنك إرسال رسالة واتساب عند إنشاء الطلب
    await sendWhatsApp(phone, 'confirmed', order._id); // نستخدم 'confirmed' كرسالة استلام

    res.json(order);
  } catch (e) {
    console.error("Error creating order:", e); // ⭐ تم تحسين تسجيل الخطأ
    res.status(500).json({ error: "Failed to create order", details: e.message }); // ⭐ تم إضافة تفاصيل الخطأ
  }
};

// ==================================================
// GET ALL ORDERS
// ==================================================
exports.getOrders = async (_, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    console.error("Error fetching orders:", e); // ⭐ تم تحسين تسجيل الخطأ
    res.status(500).json({ error: "Failed to fetch orders", details: e.message }); // ⭐ تم إضافة تفاصيل الخطأ
  }
};

// ==================================================
// UPDATE STATUS
// ==================================================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "processing", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    if (status !== "confirmed") {
      await sendWhatsApp(order.phone, status, order._id);
    }

    res.json({ msg: "Status updated", order });
  } catch (e) {
    console.error("Error updating status:", e);
    res.status(500).json({ error: "Failed to update status", details: e.message });
  }
};

// ==================================================
// MANUAL SEND WHATSAPP
// ==================================================
exports.sendManualWhatsApp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await sendWhatsApp(order.phone, order.status, order._id);

    res.json({ msg: "WhatsApp Sent!" });
  } catch (e) {
    console.error("Error sending manual WhatsApp:", e);
    res.status(500).json({ error: "Failed to send WhatsApp", details: e.message });
  }
};

// ==================================================
// DELETE ORDER
// ==================================================
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ msg: "Order deleted successfully" });
  } catch (e) {
    console.error("Error deleting order:", e);
    res.status(500).json({ error: "Failed to delete order", details: e.message });
  }
};
