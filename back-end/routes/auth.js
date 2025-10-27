// back-end/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = (req.body || {});
    if (!email || !password)
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu." });

    const u = await User.findOne({ email });
    if (!u) return res.status(400).json({ message: "Email chưa đăng ký." });

    if (u.status === "suspended")
      return res.status(403).json({ message: "Tài khoản đã bị tạm khóa." });

    if (!u.password)
      return res.status(500).json({ message: "Tài khoản chưa có mật khẩu. Hãy chạy seed mới." });

    const ok = await bcrypt.compare(password, u.password || "");
    if (!ok) return res.status(400).json({ message: "Sai mật khẩu." });

    const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
      },
    });
  } catch (err) {
    console.error("POST /auth/login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const u = await User.findById(payload.id).lean();
    if (!u) return res.status(404).json({ message: "User not found" });
    return res.json({
      id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
    });
  } catch {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body || {};
      if (!name || !email || !password)
        return res.status(400).json({ message: "Thiếu tên, email hoặc mật khẩu." });
  
      const existed = await User.findOne({ email });
      if (existed) return res.status(400).json({ message: "Email đã được sử dụng." });
  
      const hash = await bcrypt.hash(password, 10);
      const u = await User.create({
        name, email, password: hash, role: "user", status: "active",
      });
  
      const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        token,
        user: { id: u._id, name: u.name, email: u.email, avatar: u.avatar, role: u.role },
      });
    } catch (err) {
      console.error("POST /auth/register error:", err);
      res.status(500).json({ message: "Server error" });
    }
});
  
export default router;
