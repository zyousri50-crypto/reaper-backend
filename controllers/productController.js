// --- productController.js ---

const Product = require('../dbModels/Product'); 
// 🌟🌟🌟 التعديل الحاسم: تصحيح مسار استيراد Cloudinary 🌟🌟🌟
// المسار الصحيح: العودة للخلف (..) ثم استيراد الملف مباشرة باسمه (cloudinary)
const cloudinary = require('../cloudinary'); 

// دالة مساعدة لرفع الملفات إلى Cloudinary
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        // تحويل البيانات المخزنة في الذاكرة (Buffer) إلى رابط Base64
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        // استخدام Cloudinary API لرفع الملف
        cloudinary.uploader.upload(dataUri, {
            folder: "reaper-products", // اسم المجلد في Cloudinary
        })
        .then(result => resolve(result.secure_url)) // إرجاع الرابط الآمن
        .catch(error => reject(error));
    });
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

        // 💡 التعديل 1: التحقق من السعر قبل تحليل JSON (حماية من قيم undefined/NaN)
        const finalPrice = parseFloat(price);
        const finalDiscount = parseInt(discount || 0);
        const finalOutOfStock = outOfStock === 'true'; 

        if (isNaN(finalPrice) || finalPrice <= 0) {
            return res.status(400).json({ message: "Price must be a valid number greater than zero." });
        }

        // ⭐ تحليل سلاسل JSON (فك التشفير) ⭐
        let parsedSizes = [];
        let parsedColors = [];

        try {
            if (sizes) parsedSizes = JSON.parse(sizes);
            if (colors) parsedColors = JSON.parse(colors);
        } catch (e) {
            console.error("JSON Parsing Error for sizes or colors:", e);
            return res.status(400).json({ error: "Invalid format for sizes or colors." });
        }

        // 🌟 رفع الصور إلى Cloudinary 🌟
        if (!req.files || req.files.length === 0) {
             return res.status(400).json({ message: "At least one image is required." });
        }
        
        const uploadPromises = req.files.map(file => uploadToCloudinary(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        // 🌟 نهاية الرفع 🌟

        const newProduct = new Product({
            name,
            description,
            price: finalPrice, // تم التحقق منه وتخزينه
            category,
            discount: finalDiscount,
            outOfStock: finalOutOfStock,
            images: uploadedUrls, // حفظ روابط Cloudinary الدائمة
            image: uploadedUrls[0] || null, // الصورة الرئيسية
            sizes: parsedSizes, 
            colors: parsedColors,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (error) {
        // رسالة خطأ أكثر تفصيلاً في حالة فشل التحقق من المخطط (Schema)
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: "Validation failed: " + error.message });
        }
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
            sizes, colors, existingImages // existingImages هو مصفوفة روابط Cloudinary القديمة
        } = req.body;

        // 💡 التعديل 2: التحقق من السعر قبل تحليل JSON
        const finalPrice = parseFloat(price);
        const finalDiscount = parseInt(discount || 0);
        const finalOutOfStock = outOfStock === 'true';

        if (isNaN(finalPrice) || finalPrice <= 0) {
            return res.status(400).json({ message: "Price must be a valid number greater than zero." });
        }

        // ⭐ تحليل سلاسل JSON ⭐
        let parsedSizes = [];
        let parsedColors = [];
        let parsedExistingImages = [];

        try {
            if (sizes) parsedSizes = JSON.parse(sizes);
            if (colors) parsedColors = JSON.parse(colors);
            // التأكد من أن existingImages تم تمريره لتجنب خطأ JSON.parse
            if (existingImages && existingImages !== 'undefined') { 
                parsedExistingImages = JSON.parse(existingImages);
            } 
        } catch (e) {
            console.error("JSON Parsing Error during update:", e);
            return res.status(400).json({ error: "Invalid format for sizes, colors, or existing images." });
        }
        
        // 🌟 رفع الصور الجديدة إلى Cloudinary 🌟
        const newUploadPromises = req.files.map(file => uploadToCloudinary(file));
        const newUploadedUrls = await Promise.all(newUploadPromises);
        // 🌟 نهاية الرفع 🌟
        
        // دمج الروابط القديمة مع الروابط الجديدة. (إذا كان parsedExistingImages فارغاً، سيظل مصفوفة فارغة)
        const allImages = [...(parsedExistingImages || []), ...newUploadedUrls];
        
        // إذا كان المستخدم قد حذف كل الصور، فسنرفض التعديل
        if (allImages.length === 0) {
            return res.status(400).json({ message: "Product must have at least one image." });
        }


        const updateFields = {
            name,
            description,
            price: finalPrice, // تم التحقق منه وتخزينه
            category,
            discount: finalDiscount,
            outOfStock: finalOutOfStock,
            images: allImages, // استخدام جميع روابط Cloudinary
            image: allImages[0] || null, // الصورة الرئيسية
            sizes: parsedSizes, 
            colors: parsedColors,
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true } // 💡 إضافة runValidators لتطبيق قواعد Mongoose
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.json(updatedProduct);

    } catch (error) {
        // رسالة خطأ أكثر تفصيلاً في حالة فشل التحقق من المخطط (Schema)
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: "Validation failed: " + error.message });
        }
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product.", error: error.message });
    }
};

// ======================================
// 3. GET ALL PRODUCTS
// ======================================
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products.", error: error.message });
    }
};

// ======================================
// 4. GET SINGLE PRODUCT
// ======================================
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching single product:", error);
        res.status(500).json({ message: "Failed to fetch product.", error: error.message });
    }
};

// ======================================
// 5. DELETE PRODUCT
// ======================================
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.status(200).json({ message: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Failed to delete product.", error: error.message });
    }
};

// ======================================
// EXPORTS
// ======================================
module.exports = {
    addProduct,
    updateProduct,
    getProducts, 
    getProduct,  
    deleteProduct,
};
