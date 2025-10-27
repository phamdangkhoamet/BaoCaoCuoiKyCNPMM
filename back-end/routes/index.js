// back-end/routes/index.js
import { Router } from "express";

import users from "./users.js";
import authors from "./authors.js";
import novels from "./novels.js";
import chapters from "./chapters.js";
import comments from "./comments.js";
import favorites from "./favorites.js";
import follows from "./follows.js";
import notifications from "./notifications.js";
import genres from "./genres.js";
import health from "./health.js";
import posters from "./posters.js";
import auth from "./auth.js";
import reports from "./reports.js";
import paymentsSandbox from "./payments.sandbox.js";

const router = Router();
router.use("/auth", auth);
router.use("/users", users);
router.use("/authors", authors);
router.use("/novels", novels);
router.use("/chapters", chapters);
router.use("/comments", comments);
router.use("/favorites", favorites);
router.use("/follows", follows);
router.use("/notifications", notifications);
router.use("/genres", genres);
router.use("/posters", posters);
router.use("/reports", reports);
router.use("/payments", paymentsSandbox); 

router.get("/health", (_, res) => res.json({ ok: true }));


export default router;
