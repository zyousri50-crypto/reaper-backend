const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateStatus,
  sendManualWhatsApp,
  deleteOrder,
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/", getOrders);
router.put("/:id", updateStatus);
router.post("/whatsapp/:id", sendManualWhatsApp);
router.delete("/:id", deleteOrder);

module.exports = router;
