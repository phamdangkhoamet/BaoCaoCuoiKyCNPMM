import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Lấy userId từ Bearer token (fallback: ?userId=... cho dev)
function getUserId(req) {
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) {
    try {
      const token = h.split(" ")[1];
      const payload = jwt.verify(token, JWT_SECRET);
      return payload.id;
    } catch {}
  }
  // CHỈ dev/sandbox
  if (req.query.userId) return req.query.userId;
  return null;
}

// Cộng VIP
function addVipUntil(currentVipUntil, plan) {
  const base = currentVipUntil && new Date(currentVipUntil) > new Date()
    ? new Date(currentVipUntil)
    : new Date();
  if (plan === "vip1d") base.setDate(base.getDate() + 1);
  else if (plan === "vip1m") base.setDate(base.getDate() + 30);
  return base;
}

/**
 * POST /api/payments/sandbox/pay
 * body: { plan: "vip1d" | "vip1m" }
 * -> Kích hoạt VIP ngay (trạng thái paid)
 */
router.post("/sandbox/pay", async (req, res) => {
  try {
    const { plan } = req.body || {};
    if (!["vip1d", "vip1m"].includes(plan)) {
      return res.status(400).json({ message: "Gói không hợp lệ" });
    }

    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Thiếu token hoặc userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Giả lập thanh toán thành công -> nâng cấp ngay
    const newVipUntil = addVipUntil(user.vipUntil, plan);
    user.isVip = true;
    user.vipUntil = newVipUntil;
    await user.save();

    const orderId = `SBOX-${Date.now()}`;

    return res.json({
      ok: true,
      orderId,
      status: "paid",
      message: "Thanh toán sandbox thành công. VIP đã kích hoạt.",
      user: {
        id: user._id,
        isVip: true,
        vipUntil: user.vipUntil,
      },
    });
  } catch (err) {
    console.error("POST /payments/sandbox/pay error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/payments/sandbox/status/:orderId
 * -> luôn trả paid (sandbox)
 */
router.get("/sandbox/status/:orderId", (_req, res) => {
  res.json({ ok: true, status: "paid" });
});

export default router;
