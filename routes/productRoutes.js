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
router.post("/", upload.array("images", 10), validateProductInput, (req, res, next) => {
  console.log("Received product data:", req.body); // Log the received data
  console.log("Uploaded files:", req.files); // Log the uploaded files
  addProduct(req, res, next);
});

// ---------------- UPDATE PRODUCT (with images upload) ----------------
router.put("/:id", upload.array("images", 10), validateProductInput, (req, res, next) => {
  console.log("Received update data for product:", req.body); // Log the received data
  console.log("Uploaded files for update:", req.files); // Log the uploaded files for update
  updateProduct(req, res, next);
});

// ---------------- DELETE PRODUCT ----------------
router.delete("/:id", deleteProduct);

module.exports = router;
