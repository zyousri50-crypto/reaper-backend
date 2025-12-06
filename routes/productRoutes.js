const express = require("express");
const router = express.Router();
const { getProducts, getProduct, addProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const upload = require("../middleware/upload");

// ⭐⭐ التعديل الأخير: نستخدم اسم الملف الأكثر احتمالية 'authMiddleware' ⭐⭐
// إذا كان اسم ملف المصادقة لديك هو 'auth.js' فقط، قم بتغيير السطر إلى: 
// const { auth, admin } = require("../middleware/auth"); 
const { auth, admin } = require("../middleware/auth"); // يجب أن يكون هذا المسار هو الحل

// Helper for input validation
const validateProductInput = (req, res, next) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Missing required fields: name, price, and category are required" });
  }
  next();
};

// ---------------- GET ALL PRODUCTS (عام - لا يحتاج مصادقة) ----------------
router.get("/", getProducts);

// ---------------- GET SINGLE PRODUCT (عام - لا يحتاج مصادقة) ----------------
router.get("/:id", getProduct);

// ---------------- ADD PRODUCT (محمي بواسطة auth و admin) ----------------
router.post(
  "/", 
  auth, 
  admin, 
  upload.array("images", 10), 
  validateProductInput, 
  (req, res, next) => {
    console.log("Received product data:", req.body);
    console.log("Uploaded files:", req.files);
    addProduct(req, res, next);
  }
);

// ---------------- UPDATE PRODUCT (محمي بواسطة auth و admin) ----------------
router.put(
  "/:id", 
  auth, 
  admin, 
  upload.array("images", 10), 
  validateProductInput, 
  (req, res, next) => {
    console.log("Received update data for product:", req.body);
    console.log("Uploaded files for update:", req.files);
    updateProduct(req, res, next);
  }
);

// ---------------- DELETE PRODUCT (محمي بواسطة auth و admin) ----------------
router.delete("/:id", auth, admin, deleteProduct);

module.exports = router;
