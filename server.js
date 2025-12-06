// =======================
// THE REAPER BACKEND — STABLE RENDER VERSION
// =======================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// =======================
// CORS CLEAN VERSION
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
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            console.log("❌ Blocked by CORS:", origin);
            return callback(new Error("CORS Blocked"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// =======================
// Middleware
// =======================

app.use(express.json({ limit: "20mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// Routes
// =======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/promocodes", require("./routes/promoCodes"));

// =======================
// Test Route
// =======================
app.get("/", (req, res) => {
    res.send("REAPER API is running...");
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    console.error("🔥 GLOBAL ERROR:", err);
    res.status(err.status || 500).json({
        message: err.message || "Server error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
});

// =======================
// DB CONNECT + SERVER START
// =======================

mongoose
    .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("MongoDB Connected ✔");

        app.listen(process.env.PORT || 10000, "0.0.0.0", () => {
            console.log("REAPER API is running...");
        });
    })
    .catch((err) => console.log("DB Error:", err));
