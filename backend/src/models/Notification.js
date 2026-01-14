import mongoose from "mongoose";

/**
 * Notification Model
 * Stores notifications for users including goal invites, quiz completions, and daily reminders
 */
const notificationSchema = new mongoose.Schema(
  {
    // The user who will receive this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // The user who triggered this notification (if applicable)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Type of notification
    type: {
      type: String,
      enum: [
        "goal_invite", // Someone invited you to a learning goal
        "quiz_completed", // Your partner completed today's quiz
        "daily_reminder", // Reminder to complete today's quiz
        "goal_accepted", // Your goal invitation was accepted
        "goal_completed", // A shared goal was completed
      ],
      required: true,
      index: true,
    },

    // Notification content
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Related learning goal (if applicable)
    learningGoal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SharedLearningGoal",
    },

    // Whether the notification has been read
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    // When the notification was created
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of unread notifications
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
