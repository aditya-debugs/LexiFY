import express from "express";
import { protectRoutes } from "../middleware/auth.middleware.js";
import {
  createDailyWord,
  getDailyWordFeed,
  viewDailyWord,
  replyToDailyWord,
  deleteDailyWord,
  getMyActiveDailyWord,
  getStatusById,
} from "../controllers/status.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoutes);

// Create or replace active Daily Word
router.post("/", createDailyWord);

// Get feed of visible active statuses
router.get("/feed", getDailyWordFeed);

// Get current user's active Daily Word with streak info
router.get("/my-active", getMyActiveDailyWord);

// Get a specific Daily Word by ID
router.get("/:id", getStatusById);

// Record a view
router.post("/:id/view", viewDailyWord);

// Reply to a status
router.post("/:id/reply", replyToDailyWord);

// Delete your active status
router.delete("/:id", deleteDailyWord);

export default router;
