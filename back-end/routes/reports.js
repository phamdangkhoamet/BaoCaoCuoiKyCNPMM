// back-end/routes/reports.js
import { Router } from "express";
import mongoose from "mongoose";
import Report from "../models/Report.js";

const router = Router();

// POST /api/reports  (tạo báo cáo)
router.post("/", async (req, res) => {
  try {
    const { type, novelId, chapterNo, reason, description, attachments } = req.body || {};
    if (!type) return res.status(400).json({ message: "Missing type" });
    if (type === "chapter" && (!novelId || !chapterNo)) {
      return res.status(400).json({ message: "Missing novelId/chapterNo" });
    }
    if (!description || String(description).trim().length < 10) {
      return res.status(400).json({ message: "Mô tả tối thiểu 10 ký tự" });
    }

    const payload = {
      type,
      reason,
      description,
      attachments: Array.isArray(attachments) ? attachments.slice(0, 10) : [],
    };
    if (novelId) {
      payload.novelId = mongoose.Types.ObjectId.isValid(novelId)
        ? new mongoose.Types.ObjectId(novelId)
        : novelId;
    }
    if (chapterNo) payload.chapterNo = Number(chapterNo);

    // Optionally nếu đang có auth: gán userId theo token
    // const userId = req.user?.id; payload.userId = userId;

    const created = await Report.create(payload);
    return res.json(created);
  } catch (e) {
    console.error("POST /reports error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// (Tuỳ chọn) GET /api/reports  (admin xem danh sách)
router.get("/", async (req, res) => {
  try {
    const items = await Report.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    console.error("GET /reports error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
