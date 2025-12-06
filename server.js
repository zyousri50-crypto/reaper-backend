// =======================
// THE REAPER BACKEND (FINAL FIXED VERSION FOR RENDER/CORS)
// =======================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // 🌟 يجب استيراد Path هنا 🌟
require("dotenv").config();

const app = express();

// =======================
// CORS Configuration (MULTI-DOMAIN SUPPORT)
// =======================

const allowedOrigins = [
    "https://thereaper.top", 
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
        credentials: true,
    })
);

// =======================
// Middleware
// =======================

app.use(express.json({ limit: "20mb" }));

// 🌟🌟🌟 الكود الذي يجب إضافته هنا 🌟🌟🌟
// يخدم الملفات من مجلد 'uploads' عندما يطلب المتصفح مسار /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 🌟🌟🌟 نهاية الكود المُضاف 🌟🌟🌟

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
