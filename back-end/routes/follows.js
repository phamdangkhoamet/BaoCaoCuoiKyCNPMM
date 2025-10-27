import { Router } from "express";
import Follow from "../models/Follow.js";
const r = Router();

// GET /api/follows?userId=...
r.get("/", async (req, res) => {
  const { userId } = req.query;
  const list = await Follow.find({ userId });
  res.json(list);
});

export default r;
