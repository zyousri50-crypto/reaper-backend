const axios = require("axios");

const sendWhatsApp = async (phone, status, orderId) => {
  try {
    // 🟢 حل المشكلة هنا
    const shortId = String(orderId).slice(-6);

    const text =
      status === "processing"
        ? `🔄 طلبك رقم ${shortId} جاري تجهيزه الآن.`
        : status === "shipped"
        ? `🚚 طلبك رقم ${shortId} خرج مع المندوب وهو في الطريق إليك.`
        : status === "delivered"
        ? `✅ تم توصيل طلبك رقم ${shortId} بنجاح! نورتنا ❤️`
        : `✔️ تم تأكيد طلبك رقم ${shortId}.`;

    await axios.post(
      "https://api.ultramsg.com/instance153217/messages/chat?token=0egooobqitqzhbxd",
      {
        to: phone.startsWith("+") ? phone : `+2${phone}`,
        body: text,
        priority: "10",
      }
    );

    console.log("WhatsApp sent to", phone);
  } catch (err) {
    console.log("WhatsApp Error:", err?.response?.data || err);
  }
};

module.exports = sendWhatsApp;
