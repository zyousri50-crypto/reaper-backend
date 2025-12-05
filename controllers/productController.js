const Product = require("../dbModels/Product");
const cloudinary = require("../cloudinary");

// ========================
// Helper: Upload to Cloudinary
// ========================
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "products",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};

// ========================
// GET ALL PRODUCTS
// ========================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products: " + err.message });
  }
};

// ========================
// GET SINGLE PRODUCT
// ========================
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error fetching product: " + err.message });
  }
};

// =====================================================================
// ADD PRODUCT  (Supports images + sizes + colors)
// =====================================================================
exports.addProduct = async (req, res) => {
  try {
    let imageUrls = [];

    // Upload multiple images
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }

    // Required fields
    if (!req.body.name || !req.body.price || !req.body.category) {
      return res.status(400).json({
        error: "Missing required fields: name, price, category",
      });
    }

    // Safely parse JSON fields
    const parseJSON = (value) => {
      try {
        return value ? JSON.parse(value) : [];
      } catch {
        return [];
      }
    };

    const newProduct = new Product({
      name: req.body.name,
      title: req.body.title || req.body.name,
      description: req.body.description || "",

      price: Number(req.body.price),
      originalPrice: Number(req.body.originalPrice) || null,
      discount: Number(req.body.discount) || 0,

      category: req.body.category,

      image: imageUrls[0] || "",
      images: imageUrls,

      sizes: parseJSON(req.body.sizes),
      colors: parseJSON(req.body.colors),

      featured: req.body.featured === "true",
      inStock: req.body.inStock !== "false",
      bestSelling: req.body.bestSelling === "true",
      newArrival: req.body.newArrival === "true",

      promoCode: req.body.promoCode || null
    });

    const saved = await newProduct.save();
    res.json(saved);

  } catch (err) {
    console.log("Add Product Error:", err);
    res.status(500).json({ error: "Error adding product: " + err.message });
  }
};

// =====================================================================
// UPDATE PRODUCT  (Images + Sizes + Colors supported)
// =====================================================================
exports.updateProduct = async (req, res) => {
  try {
    let updateData = {};

    // Basic fields
    const fields = [
      "name", "title", "description",
      "price", "originalPrice", "discount",
      "category", "featured", "inStock",
      "bestSelling", "newArrival", "promoCode"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] =
          field === "price" ||
          field === "originalPrice" ||
          field === "discount"
            ? Number(req.body[field])
            : req.body[field];
      }
    });

    // Convert boolean strings
    ["featured", "inStock", "bestSelling", "newArrival"].forEach((b) => {
      if (req.body[b] !== undefined) {
        updateData[b] = req.body[b] === "true";
      }
    });

    // Parse JSON fields
    const parseJSON = (v) => {
      try {
        return v ? JSON.parse(v) : undefined;
      } catch {
        return undefined;
      }
    };

    const parsedSizes = parseJSON(req.body.sizes);
    const parsedColors = parseJSON(req.body.colors);

    if (parsedSizes) updateData.sizes = parsedSizes;
    if (parsedColors) updateData.colors = parsedColors;

    // =======================
    // Handle image uploads
    // =======================
    if (req.files?.length > 0) {
      let newUrls = [];
      for (let file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        newUrls.push(url);
      }

      const oldImages = parseJSON(req.body.oldImages) || [];
      updateData.images = [...oldImages, ...newUrls];
      updateData.image = updateData.images[0];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedProduct);

  } catch (err) {
    console.log("Update Product Error:", err);
    res.status(500).json({ error: "Error updating product: " + err.message });
  }
};

// ========================
// DELETE PRODUCT
// ========================
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting product: " + err.message });
  }
};
