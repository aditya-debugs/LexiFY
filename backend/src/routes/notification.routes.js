import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { protectRoutes } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoutes);

// Get all notifications for the current user
router.get("/", getNotifications);

// Mark a specific notification as read
router.patch("/:id/read", markNotificationAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllNotificationsAsRead);

// Delete a specific notification
router.delete("/:id", deleteNotification);

export default router;
