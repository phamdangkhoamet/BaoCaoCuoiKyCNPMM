import { Router } from "express";
import Author from "../models/Author.js";
import Follow from "../models/Follow.js";

const r = Router();

// GET /api/authors?q=&country=&genres=a,b&sort=&page=&pageSize=
r.get("/", async (req, res) => {
  const { q, country, genres, sort } = req.query;
  const page = +req.query.page || 1;
  const pageSize = +req.query.pageSize || 12;
  const skip = (page - 1) * pageSize;

  const cond = {};
  if (q?.trim()) {
    cond.$or = [
      { name: new RegExp(q.trim(), "i") },
      { country: new RegExp(q.trim(), "i") },
      { genres: { $elemMatch: { $regex: q.trim(), $options: "i" } } },
    ];
  }
  if (country) cond.country = country;
  if (genres) cond.genres = { $all: String(genres).split(",") };

  const total = await Author.countDocuments(cond);

  const sortMap = {
    "name-asc": { name: 1 },
    "name-desc": { name: -1 },
    "rating-desc": { rating: -1 },
    "books-desc": { booksCount: -1 }
  };

  const items = await Author.find(cond)
    .sort(sortMap[sort] || { name: 1 })
    .skip(skip)
    .limit(pageSize);

  res.json({ page, pageSize, total, items });
});

// GET /api/authors/:id
r.get("/:id", async (req, res) => {
  const a = await Author.findById(req.params.id);
  if (!a) return res.status(404).json({ message: "Not found" });
  res.json(a);
});

// POST /api/authors/:id/follow  { userId }
r.post("/:id/follow", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  await Follow.updateOne(
    { userId, authorId: req.params.id },
    { $setOnInsert: { userId, authorId: req.params.id } },
    { upsert: true }
  );
  const count = await Follow.countDocuments({ authorId: req.params.id });
  await Author.findByIdAndUpdate(req.params.id, { followers: count });
  res.json({ ok: true, followers: count });
});

// DELETE /api/authors/:id/follow  { userId }
r.delete("/:id/follow", async (req, res) => {
  const { userId } = req.body;
  await Follow.deleteOne({ userId, authorId: req.params.id });
  const count = await Follow.countDocuments({ authorId: req.params.id });
  await Author.findByIdAndUpdate(req.params.id, { followers: count });
  res.json({ ok: true, followers: count });
});

export default r;
