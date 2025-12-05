const express = require("express");
const router = express.Router();
const { getProducts, getProduct, addProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const upload = require("../middleware/upload");

// Helper for input validation
const validateProductInput = (req, res, next) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Missing required fields: name, price, and category are required" });
  }
  next();
};

// ---------------- GET ALL PRODUCTS ----------------
router.get("/", getProducts);

// ---------------- GET SINGLE PRODUCT ----------------
router.get("/:id", getProduct);

// ---------------- ADD PRODUCT (with images upload) ----------------
router.post("/", upload.array("images", 10), validateProductInput, addProduct);

// ---------------- UPDATE PRODUCT (with images upload) ----------------
router.put("/:id", upload.array("images", 10), validateProductInput, updateProduct);

// ---------------- DELETE PRODUCT ----------------
router.delete("/:id", deleteProduct);

module.exports = router;
