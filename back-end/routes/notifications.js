import { Router } from "express";
import Notification from "../models/Notification.js";
const r = Router();

// GET /api/notifications?userId=...
r.get("/", async (req, res) => {
  const { userId } = req.query;
  const list = await Notification.find({ userId }).sort({ createdAt: -1 });
  res.json(list);
});

// PATCH /api/notifications/:id/read
r.patch("/:id/read", async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ ok: true });
});

export default r;
