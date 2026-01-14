import mongoose from "mongoose";

/**
 * SharedLearningGoal Model
 *
 * Represents a learning goal shared between two friends.
 * Both users follow the same schedule and quiz structure,
 * but receive content in their respective learning languages.
 */
const sharedLearningGoalSchema = new mongoose.Schema(
  {
    // The user who created/initiated the goal
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // The friend who was invited to join
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Duration of the goal (3 to 30 days)
    duration: {
      type: Number,
      required: true,
      min: 3,
      max: 30,
    },

    // Current status of the goal
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    // When the goal was created (invitation sent)
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // When the partner accepted (goal becomes active)
    startedAt: {
      type: Date,
    },

    // Expected end date (calculated when goal starts)
    endDate: {
      type: Date,
    },

    // Daily progress tracking for both users
    progress: [
      {
        // Day number (1 to duration)
        day: {
          type: Number,
          required: true,
        },

        // Creator's quiz (in creator's learning language)
        creatorQuiz: [
          {
            question: String,
            options: [String],
            correctAnswer: Number,
            difficulty: String,
            concept: String,
          },
        ],

        // Partner's quiz (in partner's learning language)
        partnerQuiz: [
          {
            question: String,
            options: [String],
            correctAnswer: Number,
            difficulty: String,
            concept: String,
          },
        ],

        // Creator's completion for this day
        creatorCompletion: {
          completed: {
            type: Boolean,
            default: false,
          },
          completedAt: Date,
          score: Number,
          answers: [Number],
        },

        // Partner's completion for this day
        partnerCompletion: {
          completed: {
            type: Boolean,
            default: false,
          },
          completedAt: Date,
          score: Number,
          answers: [Number],
        },
      },
    ],

    // Languages being learned (stored for reference)
    creatorLanguage: {
      type: String,
      required: true,
    },

    partnerLanguage: {
      type: String,
      required: true,
    },

    // Native languages (for quiz questions)
    creatorNativeLanguage: {
      type: String,
      default: "English",
    },

    partnerNativeLanguage: {
      type: String,
      default: "English",
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding goals by user (either creator or partner)
sharedLearningGoalSchema.index({ creator: 1, status: 1 });
sharedLearningGoalSchema.index({ partner: 1, status: 1 });

// Method to check if a specific day is unlocked
sharedLearningGoalSchema.methods.isDayUnlocked = function (dayNumber) {
  if (!this.startedAt) return false;

  const daysSinceStart = Math.floor(
    (Date.now() - this.startedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return dayNumber <= daysSinceStart + 1;
};

// Method to get current day number
sharedLearningGoalSchema.methods.getCurrentDay = function () {
  if (!this.startedAt) return 0;

  const daysSinceStart = Math.floor(
    (Date.now() - this.startedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.min(daysSinceStart + 1, this.duration);
};

// Method to check if goal is expired
sharedLearningGoalSchema.methods.isExpired = function () {
  if (!this.endDate) return false;
  return Date.now() > this.endDate.getTime();
};

const SharedLearningGoal = mongoose.model(
  "SharedLearningGoal",
  sharedLearningGoalSchema
);

export default SharedLearningGoal;
