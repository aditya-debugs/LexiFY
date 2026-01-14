import express from "express";
import { protectRoutes } from "../middleware/auth.middleware.js";
import { translateText } from "../controllers/translate.controller.js";

const router = express.Router();

// POST /api/translate - Translate text to target language
router.post("/", protectRoutes, translateText);

export default router;
