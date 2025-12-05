const Product = require("../dbModels/Product");
const cloudinary = require("../cloudinary");
const { body, validationResult } = require("express-validator"); // للتحقق من المدخلات

// Helper to convert upload_stream → Promise
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products", allowed_formats: ["jpg", "jpeg", "png", "gif"] }, // تحديد أنواع الصور المسموح بها
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// ==========================
// GET ALL PRODUCTS
// ==========================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products. " + err.message });
  }
};

// ==========================
// GET SINGLE PRODUCT
// ==========================
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error fetching the product. " + err.message });
  }
};

// =====================================================================
// ADD PRODUCT  ✅ FIXED (Sizes + Colors + Images)
// =====================================================================
exports.addProduct = async (req, res) => {
  try {
    let imageUrls = [];

    // رفع الصور
    if (req.files?.length > 0) {
      for (let file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }

    // Validate input data
    if (!req.body.name || !req.body.price || !req.body.category) {
      return res.status(400).json({ error: "Missing required fields: name, price, category" });
    }

    // Parse safely
    const parseSafe = (value) => {
      try {
        return value ? JSON.parse(value) : [];
      } catch {
        return [];
      }
    };

    const newProduct = new Product({
      title: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,

      image: imageUrls[0] || "",
      images: imageUrls,

      sizes: parseSafe(req.body.sizes),
      colors: parseSafe(req.body.colors),

      bestSelling: req.body.bestSelling === "true",
      newArrival: req.body.newArrival === "true",
      discount: Number(req.body.discount) || 0,
    });

    const saved = await newProduct.save();
    res.json(saved);

  } catch (err) {
    res.status(500).json({ error: "Error adding product. " + err.message });
  }
};

// =====================================================================
// UPDATE PRODUCT  ✅ FIXED (Images + Sizes + Colors)
// =====================================================================
exports.updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Validate input data
    if (!updateData.title || !updateData.price || !updateData.category) {
      return res.status(400).json({ error: "Missing required fields: title, price, category" });
    }

    // Parse safely
    const parseSafe = (v) => {
      try {
        return v ? JSON.parse(v) : undefined;
      } catch {
        return undefined;
      }
    };

    // Convert string booleans to actual booleans
    if (updateData.bestSelling !== undefined)
      updateData.bestSelling = updateData.bestSelling === "true";

    if (updateData.newArrival !== undefined)
      updateData.newArrival = updateData.newArrival === "true";

    if (updateData.discount !== undefined)
      updateData.discount = Number(updateData.discount);

    // Process sizes + colors
    const parsedSizes = parseSafe(updateData.sizes);
    const parsedColors = parseSafe(updateData.colors);

    if (parsedSizes !== undefined) updateData.sizes = parsedSizes;
    if (parsedColors !== undefined) updateData.colors = parsedColors;

    // ===================
    // Upload new images if present
    // ===================
    if (req.files?.length > 0) {
      let newImageUrls = [];
      for (let file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        newImageUrls.push(url);
      }

      // Merge old images with new ones
      updateData.images = [...(JSON.parse(updateData.oldImages || "[]")), ...newImageUrls];

      // Main image = first image
      updateData.image = updateData.images[0];
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: "Error updating product. " + err.message });
  }
};

// ==========================
// DELETE PRODUCT
// ==========================
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting product. " + err.message });
  }
};
