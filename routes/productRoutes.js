const express = require("express");
const router = express.Router();
const { getProducts, getProduct, addProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const upload = require("../middleware/upload");

// تعديل المسار ليكون صحيحاً بناءً على الملف الذي قمت بإنشائه 'authMiddleware.js'
const { auth, admin } = require("../middleware/authMiddleware"); // تم التعديل هنا

// Helper for input validation
const validateProductInput = (req, res, next) => {
    // تم حذف التحقق من السعر هنا لأن التحقق الأهم يتم في الـ Controller
    const { name, category } = req.body; 
    if (!name || !category) {
        return res.status(400).json({ error: "Missing required fields: name and category are required" });
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
