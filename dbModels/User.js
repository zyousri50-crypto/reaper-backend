const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // This automatically adds createdAt and updatedAt fields
);

// تشفير كلمة المرور قبل حفظ المستخدم في قاعدة البيانات
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // إذا لم يتم تعديل كلمة المرور فلا داعي لتشفيرها
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// إضافة دالة للتحقق من كلمة المرور عند تسجيل الدخول
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
