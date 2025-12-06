// --- productController.js ---

const Product = require('../dbModels/Product'); 
// 🌟🌟🌟 استيراد Cloudinary 🌟🌟🌟
const cloudinary = require('../config/cloudinaryConfig'); 
// 🌟🌟🌟 تأكد من تعديل هذا المسار ليطابق مكان ملف الإعداد لديك 🌟🌟🌟

// دالة مساعدة لرفع الملفات إلى Cloudinary
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        // تحويل البيانات المخزنة في الذاكرة (Buffer) إلى رابط Base64
        // نستخدم file.mimetype و file.buffer القادمين من multer.memoryStorage
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

        // 🌟🌟🌟 التعديل الحاسم: رفع الصور إلى Cloudinary 🌟🌟🌟
        const uploadPromises = req.files.map(file => uploadToCloudinary(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        // 🌟🌟🌟 نهاية الرفع 🌟🌟🌟

        // تحويل القيم الرقمية/المنطقية
        const finalPrice = parseFloat(price);
        const finalDiscount = parseInt(discount || 0);
        const finalOutOfStock = outOfStock === 'true'; 

        const newProduct = new Product({
            name,
            description,
            price: finalPrice,
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

        // ⭐ تحليل سلاسل JSON ⭐
        let parsedSizes = [];
        let parsedColors = [];
        let parsedExistingImages = [];

        try {
            if (sizes) parsedSizes = JSON.parse(sizes);
            if (colors) parsedColors = JSON.parse(colors);
            if (existingImages) parsedExistingImages = JSON.parse(existingImages); 
        } catch (e) {
            console.error("JSON Parsing Error during update:", e);
            return res.status(400).json({ error: "Invalid format for sizes, colors, or existing images." });
        }
        
        // 🌟🌟🌟 التعديل الحاسم: رفع الصور الجديدة إلى Cloudinary 🌟🌟🌟
        const newUploadPromises = req.files.map(file => uploadToCloudinary(file));
        const newUploadedUrls = await Promise.all(newUploadPromises);
        // 🌟🌟🌟 نهاية الرفع 🌟🌟🌟
        
        // دمج الروابط القديمة مع الروابط الجديدة
        const allImages = [...(parsedExistingImages || []), ...newUploadedUrls];

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
                images: allImages, // استخدام جميع روابط Cloudinary
                image: allImages[0] || null, // الصورة الرئيسية
                sizes: parsedSizes, 
                colors: parsedColors,
            },
            { new: true }
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

// ... (باقي الدوال: getProducts, getProduct, deleteProduct)

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
