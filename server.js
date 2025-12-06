// =======================
// THE REAPER BACKEND (FINAL FIXED VERSION FOR RENDER/CORS)
// =======================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// =======================
// CORS Configuration (MULTI-DOMAIN SUPPORT)
// =======================

const allowedOrigins = [
    "https://thereaper.top",
    "https://www.thereaper.top",
    "http://thereaper.top",
    "https://darkcyan-hedgehog-829562.hostingersite.com",
    "http://localhost:5173",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log("❌ Blocked by CORS:", origin);
                callback(new Error("CORS Blocked"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);


app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log("❌ Blocked by CORS:", origin);
                callback(new Error("CORS Blocked"));
            }
        },
        credentials: true,
    })
);

// =======================
// Middleware
// =======================

app.use(express.json({ limit: "20mb" }));

// يخدم الملفات من مجلد 'uploads' عندما يطلب المتصفح مسار /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// Routes
// =======================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const promoCodeRoutes = require("./routes/promoCodes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promocodes", promoCodeRoutes);

// =======================
// Test Route
// =======================
app.get("/", (req, res) => {
    res.send("REAPER API is running...");
});

// =======================
// 🌟🌟🌟 معالج الأخطاء المركزي المضاف حديثًا 🌟🌟🌟
// هذا يضمن أن أي خطأ غير مُعالج (Unhandled Exception) سيرسل استجابة JSON 500
// بدلاً من السقوط في أي مسار افتراضي لصفحات HTML (Catch-all route).
// =======================
app.use((err, req, res, next) => {
    // نتحقق مما إذا تم إرسال الـ Headers بالفعل لتجنب الأخطاء
    if (res.headersSent) {
        return next(err);
    }
    
    console.error("🔥 GLOBAL ERROR HANDLER:", err.stack);
    
    // نرسل استجابة JSON Status 500
    res.status(err.status || 500).json({
        message: err.message || "An unexpected server error occurred.",
        // يمكن إزالة الـ stack في بيئة الإنتاج لأسباب أمنية
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, 
    });
});
// =======================
// 🌟🌟🌟 نهاية الكود المضاف 🌟🌟🌟
// =======================


// =======================
// Server + DB
// =======================
const PORT = process.env.PORT || 10000;

mongoose
    .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("MongoDB Connected ✔");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`REAPER API running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("DB Error:", err);
    });

