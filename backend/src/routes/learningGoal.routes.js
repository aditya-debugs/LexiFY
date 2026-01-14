import express from "express";
import { protectRoutes } from "../middleware/auth.middleware.js";
import {
  createLearningGoal,
  acceptLearningGoal,
  declineLearningGoal,
  getLearningGoals,
  getLearningGoalById,
  getDailyQuiz,
  submitQuiz,
  getGoalSummary,
  deleteLeaveGoal,
} from "../controllers/learningGoal.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoutes);

// Create a new shared learning goal
router.post("/create", createLearningGoal);

// Get all learning goals for current user
router.get("/", getLearningGoals);

// Get specific goal by ID
router.get("/:goalId", getLearningGoalById);

// Accept a goal invitation
router.post("/:goalId/accept", acceptLearningGoal);

// Decline a goal invitation
router.post("/:goalId/decline", declineLearningGoal);

// Delete/Leave a goal
router.delete("/:goalId", deleteLeaveGoal);

// Get quiz for a specific day
router.get("/:goalId/quiz/:day", getDailyQuiz);

// Submit quiz answers
router.post("/:goalId/quiz/:day/submit", submitQuiz);

// Get goal summary
router.get("/:goalId/summary", getGoalSummary);

export default router;
