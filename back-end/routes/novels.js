import { Router } from "express";
import mongoose from "mongoose";
import Novel from "../models/Novel.js";

const router = Router();

/**
 * 🔹 GET /api/novels
 *   - Trả danh sách truyện (lọc theo genre, q, limit)
 */
router.get("/", async (req, res) => {
  try {
    const { genre, q, limit } = req.query;
    const where = {};

    // Lọc theo thể loại
    if (genre) where.genre = genre;

    // Tìm kiếm
    if (q && q.trim()) {
      const rx = new RegExp(q.trim(), "i");
      where.$or = [{ title: rx }, { authorName: rx }, { description: rx }];
    }

    // Giới hạn số lượng
    const lim = limit ? Number(limit) : 0;

    const rows = await Novel.find(where)
      .sort({ createdAt: -1 })
      .limit(lim)
      .lean();

    // Chuẩn hoá cho frontend
    const mapped = rows.map((n) => ({
      ...n,
      author: n.author || n.authorName,
      id: n._id?.toString(),
    }));

    res.json(mapped);
  } catch (e) {
    console.error("GET /api/novels error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🔹 GET /api/novels/:id
 *   - Trả về chi tiết 1 truyện
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let novel = null;

    // Nếu id hợp lệ ObjectId -> tìm theo _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      novel = await Novel.findById(id).lean();
    }

    // Nếu không tìm được hoặc id không phải ObjectId, thử theo id custom
    if (!novel) {
      novel = await Novel.findOne({ id }).lean();
    }

    if (!novel) {
      return res.status(404).json({ message: "Novel not found" });
    }

    // Chuẩn hoá cho frontend
    novel.id = novel._id?.toString() || novel.id;
    novel.author = novel.author || novel.authorName;

    res.json(novel);
  } catch (e) {
    console.error("GET /api/novels/:id error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/novels  (tạo mới, gán author từ token)
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { title, description, genre, cover } = req.body || {};
    if (!title) return res.status(400).json({ message: "Thiếu tiêu đề" });

    const novel = await Novel.create({
      title, description, genre, cover,
      authorId: userId,
    });
    res.json(novel);
  } catch (e) {
    console.error("POST /novels", e);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/novels/:id  (chỉ tác giả mới được sửa)
router.put("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const novel = await Novel.findById(id);
    if (!novel) return res.status(404).json({ message: "Not found" });
    if (String(novel.authorId) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description, genre, cover } = req.body || {};
    if (title !== undefined) novel.title = title;
    if (description !== undefined) novel.description = description;
    if (genre !== undefined) novel.genre = genre;
    if (cover !== undefined) novel.cover = cover;
    await novel.save();

    res.json(novel.toJSON());
  } catch (e) {
    console.error("PUT /novels/:id", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
