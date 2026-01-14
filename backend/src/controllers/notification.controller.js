import Notification from "../models/Notification.js";
import SharedLearningGoal from "../models/SharedLearningGoal.js";

/**
 * Helper function to create a notification
 */
export async function createNotification({
  recipient,
  sender,
  type,
  title,
  message,
  learningGoal,
}) {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      learningGoal,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Get all notifications for the current user
 * GET /api/notifications
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "fullName username profilePic")
      .populate("learningGoal")
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
}

/**
 * Mark a specific notification as read
 * PATCH /api/notifications/:id/read
 */
export async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
}

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error updating notifications" });
  }
}

/**
 * Delete a specific notification
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
}
