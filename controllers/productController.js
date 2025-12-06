// --- productController.js ---

const Product = require('../models/Product'); // افترض أنك تستورد نموذج المنتج

// دالة مساعدة لإنشاء مسار الصور (يجب أن تكون لديك بالفعل)
const getImageUrl = (file) => {
    // استخدم منطق توليد رابط الصورة الصحيح لديك
    return file ? `/uploads/${file.filename}` : null; 
};

// ======================================
// 1. ADD PRODUCT (إضافة منتج)
// ======================================
const addProduct = async (req, res) => {
    try {
        const { 
            name, description, price, category, discount, outOfStock, 
            sizes, colors // هذه الحقول تأتي كسلاسل JSON
        } = req.body;

        // ⭐⭐⭐ الخطوة الحاسمة: تحليل سلاسل JSON ⭐⭐⭐
        let parsedSizes = [];
        let parsedColors = [];

        try {
            if (sizes) parsedSizes = JSON.parse(sizes);
            if (colors) parsedColors = JSON.parse(colors);
        } catch (e) {
            console.error("JSON Parsing Error for sizes or colors:", e);
            return res.status(400).json({ error: "Invalid format for sizes or colors." });
        }
        // ⭐⭐⭐ نهاية التحليل ⭐⭐⭐

        // معالجة الصور المرفوعة
        const images = req.files.map(getImageUrl).filter(url => url !== null);
        
        // تحويل القيم الرقمية/المنطقية
        const finalPrice = parseFloat(price);
        const finalDiscount = parseInt(discount || 0);
        const finalOutOfStock = outOfStock === 'true'; // يجب تحويل السلسلة إلى قيمة منطقية

        const newProduct = new Product({
            name,
            description,
            price: finalPrice,
            category,
            discount: finalDiscount,
            outOfStock: finalOutOfStock,
            images,
            image: images[0] || null, // الصورة الرئيسية
            sizes: parsedSizes, // استخدام المصفوفة المحللة
            colors: parsedColors, // استخدام المصفوفة المحللة
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Failed to add product.", error: error.message });
    }
};

// ======================================
// 2. UPDATE PRODUCT (تعديل منتج)
// ======================================
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, description, price, category, discount, outOfStock, 
            sizes, colors, existingImages // هذه الحقول تأتي كسلاسل JSON
        } = req.body;

        // ⭐⭐⭐ الخطوة الحاسمة: تحليل سلاسل JSON ⭐⭐⭐
        let parsedSizes = [];
        let parsedColors = [];
        let parsedExistingImages = [];

        try {
            if (sizes) parsedSizes = JSON.parse(sizes);
            if (colors) parsedColors = JSON.parse(colors);
            // قد تحتاج لتحليل الصور الموجودة إذا كنت تعدلها كسلسلة JSON أيضاً
            if (existingImages) parsedExistingImages = JSON.parse(existingImages); 
        } catch (e) {
            console.error("JSON Parsing Error during update:", e);
            return res.status(400).json({ error: "Invalid format for sizes, colors, or existing images." });
        }
        // ⭐⭐⭐ نهاية التحليل ⭐⭐⭐
        
        // معالجة الصور الجديدة
        const newImages = req.files.map(getImageUrl).filter(url => url !== null);
        
        // دمج الصور الموجودة مع الصور الجديدة
        const allImages = [...(parsedExistingImages || []), ...newImages];

        // تحويل القيم الرقمية/المنطقية
        const finalPrice = parseFloat(price);
        const finalDiscount = parseInt(discount || 0);
        const finalOutOfStock = outOfStock === 'true';

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name,
                description,
                price: finalPrice,
                category,
                discount: finalDiscount,
                outOfStock: finalOutOfStock,
                images: allImages, // استخدام جميع الصور
                image: allImages[0] || null, // الصورة الرئيسية
                sizes: parsedSizes, // استخدام المصفوفة المحللة
                colors: parsedColors, // استخدام المصفوفة المحللة
            },
            { new: true } // لإرجاع المستند المحدث
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.json(updatedProduct);

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product.", error: error.message });
    }
};

// ... (بقية دوال getProducts, getProduct, deleteProduct)

module.exports = {
    addProduct,
    updateProduct,
    // ...
};
